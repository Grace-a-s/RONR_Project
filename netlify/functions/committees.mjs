/* For performing Committte-related operations */

import { connectDatabase } from "./utils/db.mjs";
import { createRouter } from './utils/router.mjs';
import { authGuard } from './utils/guard.mjs';
import { createCommittee, getAllCommittees, getCommitteeById, updateCommitteeById } from "./controller/committeeController.mjs";
import { getMembers, addMember, removeMember, changeRole } from "./controller/membershipController.mjs";

const router = createRouter();

// Define and add routes to router
router.get("/committees", async ({ req, body }) => {
  const { user } = await authGuard(req);
  return getAllCommittees(user, body);
});

router.post('/committees', async ({req, body}) => {
  const { user } = await authGuard(req);
  return createCommittee(user, body);
});

router.get('/committees/:id', async ({req, params}) => {
  const { user } = await authGuard(req);
  return getCommitteeById(user, params.id);
});

router.patch('/committees/:id', async ({req, params, body}) => {
  // only OWNER can update committee data
  const { user } = await authGuard(req, ["OWNER"], params.id);
  return updateCommitteeById(user, params.id, body);
});

router.get('/committees/:id/member', async ({req, params}) => {
  const { user } = await authGuard(req);
  return getMembers(user, params.id);
});

router.post('/committees/:id/member', async ({req, params, body}) => {
  // only OWNER can add members
  const { user, error } = await authGuard(req, ["OWNER"], params.id);
  if (error) return error;
  return addMember(user, params.id, body);
});

router.delete('/committees/:id/member', async ({req, params, body}) => {
  // only OWNER can remove members
  const { user, error } = await authGuard(req, ["OWNER"], params.id);
  if (error) return error;
  return removeMember(user, params.id, body);
});

router.patch('/committees/:id/member', async ({req, params, body}) => {
  // only OWNER can change roles
  const { user, error } = await authGuard(req, ["OWNER"], params.id);
  if (error) return error;
  return changeRole(user, params.id, body);
});

export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
