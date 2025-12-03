import { useCallback } from 'react';
import { useApi } from './apiClient';

export const useUsersApi = () => {
	const api = useApi();
	const basePath = '/users/me';
	const buildUsernamePath = (username) => `/users/${encodeURIComponent(username)}`;

	const getCurrentUser = useCallback(() => api.get(basePath), [api, basePath]);

	const upsertCurrentUser = useCallback((payload = {}) => api.post(basePath, payload), [api, basePath]);

	const getUserByUsername = useCallback((username) => {
		if (!username) throw new Error('username is required');
		return api.get(buildUsernamePath(username));
	}, [api]);

	return {
		getCurrentUser,
		upsertCurrentUser,
		getUserByUsername,
	};
};
