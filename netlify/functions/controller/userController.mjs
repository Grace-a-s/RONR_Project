import User from '../model/User.mjs';

export async function createUser(_user, body) {
  try {
    if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const auth0Id = body.auth0Id || ( _user && _user.sub );
    if (!auth0Id) return new Response(JSON.stringify({ error: 'auth0Id required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    // avoid duplicate creation
    const existing = await User.findOne({ auth0Id }).lean();
    if (existing) return new Response(JSON.stringify(existing), { status: 200, headers: { 'content-type': 'application/json' } });

    const toCreate = {
      auth0Id,
      username: body.username || null,
      email: body.email || null,
      firstName: body.firstName || null,
      lastName: body.lastName || null
    };

    const created = await User.create(toCreate);
    return new Response(JSON.stringify(created), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}

export async function getUser(_user, auth0Id) {
  try {
    const id = auth0Id || (_user && _user.sub);
    if (!id) return new Response(JSON.stringify({ error: 'auth0Id required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const u = await User.findOne({ auth0Id: id }).lean();
    if (!u) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify(u), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}

export async function updateUser(_user, auth0Id, body) {
  try {
    const id = auth0Id || (_user && _user.sub);
    if (!id) return new Response(JSON.stringify({ error: 'auth0Id required' }), { status: 400, headers: { 'content-type': 'application/json' } });
    if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const update = {};
    if (body.username) update.username = body.username;
    if (body.email) update.email = body.email;
    if (body.firstName) update.firstName = body.firstName;
    if (body.lastName) update.lastName = body.lastName;

    if (Object.keys(update).length === 0) return new Response(JSON.stringify({ error: 'nothing to update' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const updated = await User.findOneAndUpdate({ auth0Id: id }, update, { new: true }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
