import { verifyAuth } from './jwtAuth.mjs';
import { requireRole } from './roleAuth.mjs';

// authGuard: central helper to get user and enforce role-based guards
// - req: request object
// - allowedRoles: null or array of allowed roles. If null, no role check performed.
// - committeeId: committee user belongs to
// Returns: { user, error } where user is decoded payload or null, and error is a Response (or null)
export async function authGuard(req, allowedRoles = null, committeeId = null) {
  let user;
  try {
    user = await verifyAuth(req);
  } catch (err) {
    if (err instanceof Response) {
      return { user: null, error: err };
    }
    throw err;
  }

  if (!user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      )
    };
  }

  if (!allowedRoles)
    return { user, error: null };

  const guard = requireRole(allowedRoles);
  const guardRes = await guard(user, committeeId);
  if (guardRes) 
    return { user: null, error: guardRes };
  return { user, error: null };
}

export default authGuard;
