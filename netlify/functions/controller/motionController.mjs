import Motion from '../model/Motion.mjs';
import Committee from '../model/Committee.mjs';
import mongoose from 'mongoose';

export async function createMotion(user, committeeId, body) {
	try {
		if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const { title, description } = body;
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

export async function secondMotion(user, motionId) {
    return updateMotionStatus(user, motionId, "SECONDED");
}

export async function approveMotion(user, motionId, body) {
    if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

	const { action } = body;

    if (action === "APPROVE") {
        return updateMotionStatus(user, motionId, "DEBATE");
    } else if (action == "VETO") {
        return updateMotionStatus(user, motionId, "VETOED");
    }

    return new Response(JSON.stringify({ error: 'invalid chair action' }), { status: 400, headers: { 'content-type': 'application/json' } });
}

export async function openVote(user, motionId) {
    return updateMotionStatus(motionId, "VOTING");
}

export async function closeVote(motionId, result){
    return updateMotionStatus(motionId, result);
}

async function updateMotionStatus(motionId, newMotionStatus) {
	try {
		if (!motionId || !mongoose.Types.ObjectId.isValid(motionId)) {
			return new Response(JSON.stringify({ error: 'Invalid motionId' }), { status: 400, headers: { 'content-type': 'application/json' } });
		}
		if (!newMotionStatus) 
            return new Response(JSON.stringify({ error: 'status required' }), { status: 400, headers: { 'content-type': 'application/json' } });

		const allowed = ["SECONDED", "VETOED", "DEBATE", "VOTING", "PASSED", "REJECTED"];
		if (!allowed.includes(newMotionStatus)) 
            return new Response(JSON.stringify({ error: 'invalid status' }), { status: 400, headers: { 'content-type': 'application/json' } });


        if (!checkValidMotionStatus(motionId, newMotionStatus))
            return new Response(JSON.stringify({ error: 'cannot change motion status' }), { status: 403, headers: { 'content-type': 'application/json' } });

		const updated = await Motion.findByIdAndUpdate(motionId, { status: body.status }, { new: true }).lean();
		if (!updated) 
            return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
		return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
	} catch (err) {
		return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
	}
}

// Check whether the new motion status is valid
async function checkValidMotionStatus(motionId, newMotionStatus) {
    const motion = await Motion.findById(motionId)
    const currentMotionStatus = motion.status;

    if (newMotionStatus === "SECONDED") {
        return currentMotionStatus === "PROPOSED";
    } 
    
    if (newMotionStatus === "VETOED" || newMotionStatus === "DEBATE") {
        return currentMotionStatus === "SECONDED";
    }

    if (newMotionStatus === "VOTING") {
        return currentMotionStatus === "DEBATE";
    }

    if (newMotionStatus === "PASSED" || newMotionStatus === "REJECTED") {
        return currentMotionStatus === "VOTING";
    }
}