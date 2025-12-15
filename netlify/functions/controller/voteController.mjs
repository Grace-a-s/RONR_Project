import Vote from '../model/Vote.mjs';
import Motion from '../model/Motion.mjs';
import Membership from '../model/Membership.mjs';
import Committee from '../model/Committee.mjs';
import mongoose from 'mongoose';

// Helper: tally votes for a motion and update motion status if threshold reached
async function tallyAndApplyTwoThirds(motion) {
	if (!motion) return null;
	const motionId = motion._id;
	const committeeId = motion.committeeId;

	const memberCount = await Membership.countDocuments({ committeeId });
	if (memberCount <= 0) return null;

	// Fetch committee to get voting threshold
	const committee = await Committee.findById(committeeId).lean();
	const votingThreshold = committee?.votingThreshold || 'MAJORITY';

	const supportCount = await Vote.countDocuments({ motionId, position: 'SUPPORT' });
	const opposeCount = await Vote.countDocuments({ motionId, position: 'OPPOSE' });

	// Calculate threshold based on committee setting
	const threshold = votingThreshold === 'SUPERMAJORITY'
		? Math.ceil((memberCount * 2) / 3)
		: Math.floor(memberCount / 2) + 1;

	if (supportCount >= threshold) {
		return await Motion.findByIdAndUpdate(motionId, { status: 'PASSED' }, { new: true }).lean();
	}
	if (opposeCount >= threshold) {
		return await Motion.findByIdAndUpdate(motionId, { status: 'REJECTED' }, { new: true }).lean();
	}

	return null;
}

export async function createVote(user, motionId, body) {
	try {
		if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const { position } = body;
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}
		if (!position || !['SUPPORT', 'OPPOSE'].includes(position)) {
			return new Response(JSON.stringify({ error: 'position required and must be SUPPORT|OPPOSE' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const motion = await Motion.findById(motionId);
		if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

		if (motion.status !== "VOTING")
			return new Response(JSON.stringify({ error: 'motion status is not VOTING' }), { status: 403, headers: { 'content-type': 'application/json' } });


		const authorId = (user && user.sub) ? user.sub : body.authorId;
		if (!authorId) return new Response(JSON.stringify({ error: 'authorId required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		// prevent duplicate votes from same user for a motion
		const existing = await Vote.findOne({ motionId, authorId });
		if (existing) 
            return new Response(JSON.stringify(existing), { status: 200, headers: { 'content-type': 'application/json' } });

		const vote = await Vote.create({ motionId, authorId, position });

		// After each vote, check the 2/3rd threshold has been met for support/oppose
		try {
			const updatedMotion = await tallyAndApplyTwoThirds(motion);
			if (updatedMotion) {
				return new Response(JSON.stringify({ vote, motion: updatedMotion }), { status: 200, headers: { 'content-type': 'application/json' } });
			}
		} catch (e) {
			console.error('Vote tallying error', e);
		}

		return new Response(JSON.stringify(vote), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}

export async function getAllVotes(user, motionId) {
	try {
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const votes = await Vote.find({ motionId }).sort({ createdAt: -1 }).lean();
		return new Response(JSON.stringify(votes), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}