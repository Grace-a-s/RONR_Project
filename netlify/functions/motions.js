/* For performing motion related operations */

import { createDebate, getAllDebates } from "./controller/debateController.mjs";
import { approveMotion, createMotion, getAllMotions, getMotionById, openVote } from "./controller/motionController.mjs";

const router = createRouter();

const user = null;

router.post('/committees/:id/motions', ({req, params, body}) => 
  createMotion(user, params.id, body)
);

router.get('/committees/:id/motions', ({req, params, body}) =>
  getAllMotions(user, params.id)
);

router.get('/motions/:id', ({req, params}) =>
  getMotionById(user, params.id)
);

router.post('/motions/:id/second', ({req, params, body}) =>
  secondMotion(user, params.id)
);

router.post('/motions/:motionId/chair/approve', ({req, params, body}) => 
  approveMotion(user, params.id, body)
);

router.post('motion/:motionId/debate', ({req, params, body}) =>
  createDebate(user, params.id, body)
);

router.get('motions/:motionId/debate', ({req, params}) => 
  getAllDebates(user, params.id)
);

router.post('/motions/:motionId/vote', ({req, params, body}) =>
  createVote(user, params.id, body)
);

router.get('/motions/:motionId/vote', ({req, params, body}) =>
  getAllVotes(user, params.id)
);

router.post('/motions/:motionId/chair/open-vote', ({req, params}) => 
  openVote(user, params.id)
);


export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}