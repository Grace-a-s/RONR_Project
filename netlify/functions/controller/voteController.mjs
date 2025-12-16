import Vote from "../model/Vote.mjs";
import Motion from "../model/Motion.mjs";
import Membership from "../model/Membership.mjs";
import Committee from "../model/Committee.mjs";
import mongoose from "mongoose";

// Helper: tally votes for a motion and update motion status if threshold reached
async function tallyAndApplyTwoThirds(motion) {
  if (!motion) return null;
  const motionId = motion._id;
  const committeeId = motion.committeeId;

  // Get all memberships EXCEPT the Chair (Chairs are excluded from voting)
  const nonChairMemberships = await Membership.find({
    committeeId,
    role: { $ne: "CHAIR" },
  }).lean();

  const memberCount = nonChairMemberships.length;
  if (memberCount <= 0) return null;

  // Fetch committee to get voting threshold
  const committee = await Committee.findById(committeeId).lean();
  const votingThreshold = committee?.votingThreshold || "MAJORITY";

  const supportCount = await Vote.countDocuments({
    motionId,
    position: "SUPPORT",
  });
  const opposeCount = await Vote.countDocuments({
    motionId,
    position: "OPPOSE",
  });

  // Calculate threshold based on committee setting
  const threshold =
    votingThreshold === "SUPERMAJORITY"
      ? Math.ceil((memberCount * 2) / 3)
      : Math.floor(memberCount / 2) + 1;

  if (supportCount >= threshold) {
    return await Motion.findByIdAndUpdate(
      motionId,
      { status: "PASSED" },
      { new: true }
    ).lean();
  }
  if (opposeCount >= threshold) {
    return await Motion.findByIdAndUpdate(
      motionId,
      { status: "REJECTED" },
      { new: true }
    ).lean();
  }

  // Check if motion is mathematically impossible to pass
  // If oppose votes equal or exceed (memberCount - threshold), it's impossible to pass
  if (opposeCount > memberCount - threshold) {
    return await Motion.findByIdAndUpdate(
      motionId,
      { status: "REJECTED" },
      { new: true }
    ).lean();
  }

  return null;
}

// Special tally function for veto challenge votes - excludes Chair and uses fixed 2/3 threshold
async function tallyVetoChallenge(motion) {
  if (!motion) return null;
  const motionId = motion._id;
  const committeeId = motion.committeeId;

  // Get all memberships EXCEPT the Chair
  const nonChairMemberships = await Membership.find({
    committeeId,
    role: { $ne: "CHAIR" }, // Exclude CHAIR role
  }).lean();

  const eligibleMemberCount = nonChairMemberships.length;
  if (eligibleMemberCount <= 0) return null;

  // Count votes from non-Chair members only
  const allVotes = await Vote.find({ motionId }).lean();

  // Filter out any votes from Chair (safety measure)
  const chairMembership = await Membership.findOne({
    committeeId,
    role: "CHAIR",
  }).lean();
  const chairUserId = chairMembership ? chairMembership.userId : null;

  const validVotes = chairUserId
    ? allVotes.filter((v) => v.authorId !== chairUserId)
    : allVotes;

  const supportCount = validVotes.filter(
    (v) => v.position === "SUPPORT"
  ).length;
  const opposeCount = validVotes.filter((v) => v.position === "OPPOSE").length;

  // FIXED 2/3 threshold (SUPERMAJORITY) regardless of committee settings
  const threshold = Math.ceil((eligibleMemberCount * 2) / 3);

  // Mark that challenge has been conducted
  await Motion.findByIdAndUpdate(motionId, { vetoChallengeConducted: true });

  // SUPPORT votes mean "overrule the veto" → motion goes to DEBATE
  if (supportCount >= threshold) {
    return await Motion.findByIdAndUpdate(
      motionId,
      { status: "DEBATE" },
      { new: true }
    ).lean();
  }

  // OPPOSE votes mean "uphold the veto" → motion status becomes VETO_CONFIRMED
  // Also trigger if threshold votes reached for OPPOSE
  if (opposeCount >= threshold) {
    return await Motion.findByIdAndUpdate(
      motionId,
      { status: "VETO_CONFIRMED" },
      { new: true }
    ).lean();
  }

  return null;
}

export async function createVote(user, motionId, body) {
  try {
    if (!body)
      return new Response(JSON.stringify({ error: "body required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const { position } = body;
    if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
      return new Response(JSON.stringify({ error: "Invalid motionId" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (!position || !["SUPPORT", "OPPOSE"].includes(position)) {
      return new Response(
        JSON.stringify({
          error: "position required and must be SUPPORT|OPPOSE",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const motion = await Motion.findById(motionId);
    if (!motion)
      return new Response(JSON.stringify({ error: "Motion not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    if (motion.status !== "VOTING" && motion.status !== "CHALLENGING_VETO")
      return new Response(
        JSON.stringify({ error: "motion is not open for voting" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );

    const authorId = user && user.sub ? user.sub : body.authorId;
    if (!authorId)
      return new Response(JSON.stringify({ error: "authorId required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    // Chairs cannot vote on any motion
    const membership = await Membership.findOne({
      userId: authorId,
      committeeId: motion.committeeId,
    }).lean();

    if (membership && membership.role === "CHAIR") {
      return new Response(JSON.stringify({ error: "Chair cannot vote" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }

    // prevent duplicate votes from same user for a motion
    const existing = await Vote.findOne({ motionId, authorId });
    if (existing)
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const vote = await Vote.create({ motionId, authorId, position });

    // After each vote, check if threshold has been met
    try {
      let updatedMotion;

      // Use special tally function for veto challenges
      if (motion.status === "CHALLENGING_VETO") {
        updatedMotion = await tallyVetoChallenge(motion);
      } else {
        // Use regular tally for normal votes
        updatedMotion = await tallyAndApplyTwoThirds(motion);
      }

      if (updatedMotion) {
        return new Response(JSON.stringify({ vote, motion: updatedMotion }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
    } catch (e) {
      console.error("Vote tallying error", e);
    }

    return new Response(JSON.stringify(vote), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function getAllVotes(user, motionId) {
  try {
    if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
      return new Response(JSON.stringify({ error: "Invalid motionId" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Fetch the motion to get committeeId
    const motion = await Motion.findById(motionId).lean();
    if (!motion) {
      return new Response(JSON.stringify({ error: "Motion not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    // Fetch committee to check anonymous voting setting
    const committee = await Committee.findById(motion.committeeId).lean();
    const isAnonymous = committee?.anonymousVoting || false;

    const votes = await Vote.find({ motionId }).sort({ createdAt: -1 }).lean();

    // If anonymous mode is enabled, filter out identifying information
    if (isAnonymous) {
      const filteredVotes = votes.map((vote) => ({
        _id: vote._id,
        motionId: vote.motionId,
        authorId: vote.authorId, // Keep for user's own vote identification
        position: vote.position,
        // Omit createdAt and updatedAt to prevent identification
      }));
      return new Response(JSON.stringify(filteredVotes), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // Public mode - return all data
    return new Response(JSON.stringify(votes), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
