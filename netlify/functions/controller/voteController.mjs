import Vote from '../model/Vote.mjs';
import Motion from '../model/Motion.mjs';
import mongoose from 'mongoose';

export async function createVote(user, body) {
	try {
		if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const { motionId, position } = body;
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}
		if (!position || !['SUPPORT', 'OPPOSE', 'NEUTRAL'].includes(position)) {
			return new Response(JSON.stringify({ error: 'position required and must be SUPPORT|OPPOSE|NEUTRAL' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const motion = await Motion.findById(motionId);
		if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

		const authorId = (user && user.sub) ? user.sub : body.authorId;
		if (!authorId) return new Response(JSON.stringify({ error: 'authorId required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		// prevent duplicate votes from same user for a motion
		const existing = await Vote.findOne({ motionId, authorId });
		if (existing) return new Response(JSON.stringify(existing), { status: 200, headers: { 'content-type': 'application/json' } });

		const vote = await Vote.create({ motionId, authorId, position });
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

		const votes = await Vote.find({ motionId }).sort({ createdAt: -1 });
		return new Response(JSON.stringify(votes), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}