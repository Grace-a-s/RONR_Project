/* For performing user-related operations */

import { connectDatabase } from "./utils/db.mjs";
import { createRouter } from './utils/router.mjs';
import { authGuard } from './utils/guard.mjs';
import { getUser, createUser, updateUser, getUserByUsername } from "./controller/userController.mjs";

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

router.get('/users/:username', async ({ req, params }) => {
  const { user, error } = await authGuard(req);
  if (error) return error;
  return getUserByUsername(user, params.username);
});

export default async function(req, context) {
  await connectDatabase();
  return router.handle(req, context);
}
