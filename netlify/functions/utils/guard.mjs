import { verifyAuth } from './jwtAuth.mjs';
import { requireRole } from './roleAuth.mjs';

// authGuard: central helper to get user and enforce role-based guards
// - req: request object
// - allowedRoles: null or array of allowed roles. If null, no role check performed.
// - committeeId: committee user belongs to
// Returns: { user, error } where user is decoded payload or null, and error is a Response (or null)
export async function authGuard(req, allowedRoles = null, committeeId = null) {
  const user = await verifyAuth(req);

  if (!allowedRoles) 
    return { user, error: null };

  const guard = requireRole(allowedRoles);
  const guardRes = await guard(user, committeeId);
  if (guardRes) 
    return { user: null, error: guardRes };
  return { user, error: null };
}

export default authGuard;
