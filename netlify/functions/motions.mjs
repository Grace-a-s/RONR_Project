/* For performing motion related operations */

import { connectDatabase } from "./utils/db.mjs";
import { createRouter } from './utils/router.mjs';
import { createDebate, getAllDebates } from './controller/debateController.mjs';
import { approveMotion, createMotion, getAllMotions, getMotionById, openVote, secondMotion } from './controller/motionController.mjs';
import { createVote, getAllVotes } from './controller/voteController.mjs';
import { authGuard } from './utils/guard.mjs';
import Motion from './model/Motion.mjs';

const router = createRouter();

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

router.get('/motions/:id', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getMotionById(user, params.id);
});

router.post('/motions/:id/second', async ({req, params, body}) => {
  // any authenticated user (not the author) may second a motion
  const { user, error } = await authGuard(req);
  if (error) return error;

  const motionId = params.id;
  const motion = await Motion.findById(motionId).lean();
  if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });

  if (motion.authorId && user.sub && motion.authorId.toString() === user.sub.toString()) {
    return new Response(JSON.stringify({ error: 'author cannot second their own motion' }), { status: 403, headers: { 'content-type': 'application/json' } });
  }

  return secondMotion(user, motionId);
});

router.post('/motions/:id/chair/approve', async ({req, params, body}) => {
  // only CHAIR can approve/veto
  const motionId = params.id;
  const motion = await Motion.findById(motionId).lean();
  if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const committeeId = motion.committeeId;
  const { user, error } = await authGuard(req, ['CHAIR'], committeeId);
  if (error) return error;
  return approveMotion(user, motionId, body);
});

router.post('/motions/:id/debate', async ({req, params, body}) => {
  // debate participants must be committee members
  const motionId = params.id;
  const motion = await Motion.findById(motionId).lean();
  if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const committeeId = motion.committeeId;
  const { user, error } = await authGuard(req, ['OWNER','MEMBER'], committeeId);
  if (error) return error;
  return createDebate(user, motionId, body);
});

router.get('/motions/:id/debate', async ({req, params}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  const motionId = params.id;
  return getAllDebates(user, motionId);
});

router.post('/motions/:id/vote', async ({req, params, body}) => {
  // only committee members can vote
  const motionId = params.motionId || params.id;
  const motion = await Motion.findById(motionId).lean();
  if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const committeeId = motion.committeeId;
  const { user, error } = await authGuard(req, ['OWNER','MEMBER'], committeeId);
  if (error) return error;
  return createVote(user, motionId, body);
});

router.get('/motions/:id/vote', async ({req, params, body}) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  const motionId = params.id;
  return getAllVotes(user, motionId);
});

router.post('/motions/:id/chair/open-vote', async ({req, params}) => {
  // only CHAIR can open vote
  const motionId = params.id;
  const motion = await Motion.findById(motionId).lean();
  if (!motion) return new Response(JSON.stringify({ error: 'Motion not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
  const committeeId = motion.committeeId;
  const { user, error } = await authGuard(req, ['CHAIR'], committeeId);
  if (error) return error;
  return openVote(user, motionId);
});


export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}