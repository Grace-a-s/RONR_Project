import Motion from '../model/Motion.mjs';
import Committee from '../model/Committee.mjs';
import mongoose from 'mongoose';

export async function createMotion(user, body) {
	try {
		if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const { committeeId, title, description } = body;
		if (!committeeId || !mongoose.Types.ObjectId.isValid(committeeId)) {
			return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}
		if (!title) return new Response(JSON.stringify({ error: 'title required' }), { status: 400, headers: { 'content-type': 'application/json' } });
		if (!description) return new Response(JSON.stringify({ error: 'description required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const committee = await Committee.findById(committeeId);
		if (!committee) return new Response(JSON.stringify({ error: 'Committee not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

		const authorId = (user && user.sub) ? user.sub : body.authorId;
		if (!authorId) return new Response(JSON.stringify({ error: 'authorId required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const motion = await Motion.create({ committeeId, authorId, title, description });
		return new Response(JSON.stringify(motion), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}

export async function getAllMotions(user, committeeId) {
	try {
		if (!committeeId || !mongoose.Types.ObjectId.isValid(committeeId)) {
			return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const motions = await Motion.find({ committeeId }).sort({ createdAt: -1 });
		return new Response(JSON.stringify(motions), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}

export async function getMotionById(user, motionId) {
	try {
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}

		const motion = await Motion.findById(motionId).lean();
		if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
		return new Response(JSON.stringify(motion), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}

export async function updateMotionStatus(user, motionId, body) {
	try {
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}
		if (!body || !body.status) return new Response(JSON.stringify({ error: 'status required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const allowed = ["PROPOSED", "SECONDED", "VETOED", "DEBATE", "VOTING", "PASSED", "REJECTED"];
		if (!allowed.includes(body.status)) return new Response(JSON.stringify({ error: 'invalid status' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const updated = await Motion.findByIdAndUpdate(motionId, { status: body.status }, { new: true }).lean();
		if (!updated) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
		return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}