import { useCallback } from 'react';
import { useApi } from './apiClient';

export const useUsersApi = () => {
	const api = useApi();
	const basePath = '/users/me';

	const getCurrentUser = useCallback(() => api.get(basePath), [api, basePath]);

	const upsertCurrentUser = useCallback((payload = {}) => api.post(basePath, payload), [api, basePath]);

	return {
		getCurrentUser,
		upsertCurrentUser,
	};
};
