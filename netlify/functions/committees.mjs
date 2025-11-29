/* For performing Committte-related operations */

import { connectDatabase } from "./db.mjs";
import { createRouter } from './router.mjs';
import { createCommittee, getAllCommittees, getCommitteeById, updateCommitteeById } from "./controller/committeeController.mjs";
import { getMembers, addMember, removeMember, changeRole } from "./controller/membershipController.mjs";

const router = createRouter();

const user = null;

// Define and add routes to router
router.get("/committees", ({ req, body }) =>
  getAllCommittees(user, body)
);

router.post('/committees', ({req, body}) =>
  createCommittee(user, body)
);

router.get('/committees/:id', ({req, params}) => 
  getCommitteeById(user, params.id)
);

router.patch('/committees/:id', ({req, params, body}) => 
  updateCommitteeById(user, params.id, body)
);

router.get('/committees/:id/member', ({req, params}) => 
  getMembers(user, params.id)
);

router.post('/committees/:id/member', ({req, params, body}) => 
  addMember(user, params.id, body)
);

router.delete('/committees/:id/member', ({req, params, body}) => 
  removeMember(user, params.id, body)
);

router.patch('/committees/:id/member', ({req, params, body}) => 
  changeRole(user, params.id, body)
);

export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
