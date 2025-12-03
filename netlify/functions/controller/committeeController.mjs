import Committee from "../model/Committee.mjs";
import Membership from "../model/Membership.mjs";
import mongoose from 'mongoose';

export async function createCommittee(user, body) {
    try {
        if (!body || !body.name) {
            return new Response(JSON.stringify({ error: 'name is required' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }

        
        const committee = await Committee.create({
            name: body.name,
            description: body.description
        });

        // create membership for creator if user is provided
        try {
            if (user && user.sub) {
                await Membership.create({
                    committeeId: committee._id,
                    userId: user.sub,
                    role: 'OWNER'
                });
            }
        } catch (e) {
            // membership creation failed, but committee exists — log and continue
            console.error('Failed to create membership for committee creator', e);
        }
        return new Response(JSON.stringify(committee), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
}

export async function getAllCommittees(user, body) {
    try {
        const userId = user?.sub;
        if (!userId) {
            return new Response(JSON.stringify({ error: 'auth0Id required' }), { status: 401, headers: { 'content-type': 'application/json' } });
        }

        const memberships = await Membership.find({ userId }).select('committeeId').lean();
        const committeeIds = memberships
            .map((membership) => membership.committeeId)
            .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

        if (committeeIds.length === 0) {
            return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });
        }

        const committees = await Committee.find({ _id: { $in: committeeIds } }).lean();
        return new Response(JSON.stringify(committees), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
}

export async function getCommitteeById(user, committeeId) {
    try {
        if (!committeeId || !mongoose.Types.ObjectId.isValid(committeeId)) {
            return new Response(JSON.stringify({ error: 'Invalid committee id' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }

        const committee = await Committee.findById(committeeId).lean();
        if (!committee) return new Response(JSON.stringify({ error: 'Committee not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
        return new Response(JSON.stringify(committee), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
}

export async function updateCommitteeById(user, committeeId, body) {
    try {
        if (!committeeId || !mongoose.Types.ObjectId.isValid(committeeId)) {
            return new Response(JSON.stringify({ error: 'Invalid committee id' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

        const update = {};
        if (body.name) update.name = body.name;
        if (body.description) update.description = body.description;

        const updated = await Committee.findByIdAndUpdate(committeeId, update, { new: true }).lean();
        if (!updated) return new Response(JSON.stringify({ error: 'Committee not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
        return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
}
