import { useCallback } from "react";
import { useApi } from "./apiClient";

export const useUsersApi = () => {
  const api = useApi();
  const basePath = "/users/me";
  const buildUsernamePath = (username) =>
    `/users/${encodeURIComponent(username)}`;
  const buildIdPath = (id) => `/users/id/${encodeURIComponent(id)}`;

  const getCurrentUser = useCallback(() => api.get(basePath), [api, basePath]);

  const upsertCurrentUser = useCallback(
    (payload = {}) => api.post(basePath, payload),
    [api, basePath]
  );

  const getUserByUsername = useCallback(
    (username) => {
      if (!username) throw new Error("username is required");
      return api.get(buildUsernamePath(username));
    },
    [api]
  );

  const getUsernameById = useCallback(
    (id) => {
      if (!id) throw new Error("id is required");
      // this endpoint is public; avoid forcing an auth token
      return api.get(buildIdPath(id));
    },
    [api]
  );

  return {
    getCurrentUser,
    upsertCurrentUser,
    getUserByUsername,
    getUsernameById,
  };
};
