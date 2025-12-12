/* For performing user-related operations */

import { connectDatabase } from "./utils/db.mjs";
import { createRouter } from "./utils/router.mjs";
import { authGuard } from "./utils/guard.mjs";
import {
  getUser,
  createUser,
  updateUser,
  getUserByUsername,
} from "./controller/userController.mjs";

const router = createRouter();

router.get("/users/me", async ({ req }) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getUser(user);
});

router.post("/users/me", async ({ req, body }) => {
  const { user, error } = await authGuard(req);
  if (error) return error;

  // If user exists, update them; otherwise create them
  if (user && user.sub) {
    // Try to get existing user first
    const existingUserResponse = await getUser(user);
    let existingUser = null;
    if (existingUserResponse.body) {
      existingUser = await existingUserResponse.json();
    }

    if (existingUser && existingUser._id) {
      // User exists, update them
      return updateUser(user, user.sub, body);
    }
  }

  // User doesn't exist, create them
  return createUser(user, body);
});

router.get("/users/:username", async ({ req, params }) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getUserByUsername(user, params.username);
});

//I dont think this is ncessary
// Return only the username for a given user id
router.get("/users/id/:id", async ({ req, params }) => {
  // This endpoint is intentionally public (no auth required) because callers
  // may need to resolve a username from an internal _id. If you want to
  // restrict this, wrap with authGuard like other routes.
  return getUsernameById(null, params.id);
});

export default async function (req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
