import Debate from "../model/Debate.mjs";
import Motion from "../model/Motion.mjs";
import mongoose from "mongoose";

export async function createDebate(user, motionId, body) {
  try {
    if (!body)
      return new Response(JSON.stringify({ error: "body required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const { position, content } = body;
    if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
      return new Response(JSON.stringify({ error: "Invalid motionId" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    if (!position || !["SUPPORT", "OPPOSE", "NEUTRAL"].includes(position)) {
      return new Response(
        JSON.stringify({
          error: "position required and must be SUPPORT|OPPOSE|NEUTRAL",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
    if (!content)
      return new Response(JSON.stringify({ error: "content required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const motion = await Motion.findById(motionId);
    if (!motion)
      return new Response(JSON.stringify({ error: "Motion not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });

    //if (motion.status !== "DEBATE")
    //   return new Response(JSON.stringify({ error: 'motion status is not DEBATE' }), { status: 403, headers: { 'content-type': 'application/json' } });
    if (motion.status !== "SECONDED")
      return new Response(
        JSON.stringify({ error: "motion status is not Seconded" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );

    const authorId = user && user.sub ? user.sub : body.authorId;
    if (!authorId)
      return new Response(JSON.stringify({ error: "authorId required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });

    const debate = await Debate.create({
      motionId,
      authorId,
      position,
      content,
    });
    return new Response(JSON.stringify(debate), {
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

export async function getAllDebates(user, motionId) {
  try {
    if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
      return new Response(JSON.stringify({ error: "Invalid motionId" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const debates = await Debate.find({ motionId }).sort({ createdAt: -1 });
    return new Response(JSON.stringify(debates), {
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
