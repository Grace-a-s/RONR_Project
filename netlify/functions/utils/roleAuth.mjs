import Membership from '../model/Membership.mjs';

// Helper function for retrieving user's role within a committee
export async function getUserMembershipRole(user, committeeId) {
  if (!user || !user.sub) return null;
  if (!committeeId) return null;

  const membership = await Membership.findOne({
    committeeId,
    userId: user.sub
  }).lean();

  return membership ? membership.role : null;
} 

export function requireRole(allowedRoles = []) {
    return async (user, committeeId) => {
        if (!user || !user.sub) {
            return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { 'content-type': 'application/json' } });
        }

        if (!committeeId) {
            return new Response(JSON.stringify({ error: "committeeId required" }), { status: 400, headers: { 'content-type': 'application/json' } });
        }

        const role = await getUserMembershipRole(user, committeeId);
        if (!role) {
            return new Response(JSON.stringify({ error: "membership required" }), { status: 403, headers: { 'content-type': 'application/json' } });
        }

        if (!allowedRoles.includes(role)) {
            return new Response(JSON.stringify({ error: "user lacks permissions to perform request" }), { status: 403, headers: { 'content-type': 'application/json' } });
        }

        return null;
    }
}