import User from '../model/User.mjs';

const normalizeString = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || null;
};

const hasField = (obj, field) => Object.prototype.hasOwnProperty.call(obj || {}, field);

export async function createUser(_user, body) {
  try {
    if (!body) return new Response(JSON.stringify({ error: 'body required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const auth0Id = body.auth0Id || ( _user && _user.sub );
    if (!auth0Id) return new Response(JSON.stringify({ error: 'auth0Id required' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const normalizedUsername = normalizeString(body.username);
    if (normalizedUsername) {
      const existingUsername = await User.findOne({ username: normalizedUsername }).lean();
      if (existingUsername) {
        return new Response(JSON.stringify({ error: 'username already exists' }), { status: 409, headers: { 'content-type': 'application/json' } });
      }
    }

    // avoid duplicate creation
    const existing = await User.findById(auth0Id).lean();
    if (existing) return new Response(JSON.stringify(existing), { status: 200, headers: { 'content-type': 'application/json' } });

    const toCreate = {
      _id: auth0Id,
      username: normalizedUsername,
      email: normalizeString(body.email),
      firstName: normalizeString(body.firstName),
      lastName: normalizeString(body.lastName),
      pronouns: normalizeString(body.pronouns),
      about: normalizeString(body.about),
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

    const u = await User.findById(id).lean();
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
    if (hasField(body, 'username')) {
      const normalizedUsername = normalizeString(body.username);
      if (normalizedUsername) {
        const existingUsername = await User.findOne({ username: normalizedUsername, _id: { $ne: id } }).lean();
        if (existingUsername) {
          return new Response(JSON.stringify({ error: 'username already exists' }), { status: 409, headers: { 'content-type': 'application/json' } });
        }
      }
      update.username = normalizedUsername;
    }
    if (hasField(body, 'email')) update.email = normalizeString(body.email);
    if (hasField(body, 'firstName')) update.firstName = normalizeString(body.firstName);
    if (hasField(body, 'lastName')) update.lastName = normalizeString(body.lastName);
    if (hasField(body, 'pronouns')) update.pronouns = normalizeString(body.pronouns);
    if (hasField(body, 'about')) update.about = normalizeString(body.about);

    if (Object.keys(update).length === 0) return new Response(JSON.stringify({ error: 'nothing to update' }), { status: 400, headers: { 'content-type': 'application/json' } });

    const updated = await User.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}

export async function getUserByUsername(_user, username) {
  try {
    if (!username) {
      return new Response(JSON.stringify({ error: 'username required' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify(user), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.toString() }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
