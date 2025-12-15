/* For performing Committte-related operations */

import { connectDatabase } from "./utils/db.mjs";
import { createRouter } from './utils/router.mjs';
import { authGuard } from './utils/guard.mjs';
import { createCommittee, getAllCommittees, getCommitteeById, updateCommitteeById, updateVotingThreshold } from "./controller/committeeController.mjs";
import { getMembers, addMember, removeMember, changeRole } from "./controller/membershipController.mjs";
import { createMotion, getAllMotions } from './controller/motionController.mjs';

const router = createRouter();

// Define and add routes to router
// List all motions for a committee
router.get('/committees/:committeeId/motions', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getAllMotions(user, params.committeeId);
});

// Create a new motion for a committee
router.post('/committees/:committeeId/motions', async ({req, params, body}) => {
  const { user, error } = await authGuard(req, ['OWNER', 'MEMBER'], params.committeeId);
  if (error) return error;
  return createMotion(user, params.committeeId, body);
});

router.get("/committees", async ({ req, body }) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getAllCommittees(user, body);
});

router.post('/committees', async ({req, body}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return createCommittee(user, body);
});

router.get('/committees/:id', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getCommitteeById(user, params.id);
});

router.patch('/committees/:id', async ({req, params, body}) => {
  // only OWNER can update committee data
  const { user, error } = await authGuard(req, ["OWNER"], params.id);
  if (error) return error;
  return updateCommitteeById(user, params.id, body);
});

router.patch('/committees/:id/voting-threshold', async ({req, params, body}) => {
  // only CHAIR can update voting threshold
  const { user, error } = await authGuard(req, ["CHAIR"], params.id);
  if (error) return error;
  return updateVotingThreshold(user, params.id, body);
});

router.get('/committees/:id/member', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
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

router.post('/committees/:id/motions', async ({req, params, body}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return createMotion(user, params.id, body);
});

router.get('/committees/:id/motions', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getAllMotions(user, params.id);
});


export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
