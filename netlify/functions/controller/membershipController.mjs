import Membership from '../model/Membership.mjs';
import Committee from '../model/Committee.mjs';
import mongoose from 'mongoose';

export async function getMembers(user, committeeId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const committee = await Committee.findById(committeeId);
    if (!committee) return new Response(JSON.stringify({ error: 'Committee not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

    const members = await Membership.find({ committeeId }).populate('userId', 'name email');
    return new Response(JSON.stringify(members), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function addMember(user, committeeId, body) {
  try {
    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const items = Array.isArray(body) ? body : [body];
    const created = [];

    for (const it of items) {
      const { userId, role } = it;
      if (!userId) continue;
      // Avoid duplicates
      const existing = await Membership.findOne({ committeeId, userId });
      if (existing) {
        created.push(existing);
        continue;
      }
      const m = await Membership.create({ committeeId, userId, role: role || 'MEMBER' });
      created.push(m);
    }

    return new Response(JSON.stringify(created), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}

export async function removeMember(user, committeeId, body) {
  try {
    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const { userId } = body || {};
    if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const res = await Membership.deleteOne({ committeeId, userId });
    return new Response(JSON.stringify({ deletedCount: res.deletedCount }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}

export async function changeRole(user, committeeId, body) {
  try {
    if (!mongoose.Types.ObjectId.isValid(committeeId)) {
      return new Response(JSON.stringify({ error: 'Invalid committeeId' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const { userId, role } = body || {};
    if (!userId || !role) return new Response(JSON.stringify({ error: 'userId and role required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const updated = await Membership.findOneAndUpdate(
      { committeeId, userId },
      { role },
      { new: true }
    );

    if (!updated) return new Response(JSON.stringify({ error: 'Membership not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
