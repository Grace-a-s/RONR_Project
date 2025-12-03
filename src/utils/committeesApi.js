import { useCallback } from 'react';
import { useApi } from './apiClient';

const withId = (id) => `/committees/${encodeURIComponent(id)}`;

export const useCommitteesApi = () => {
  const api = useApi();

  const listCommittees = useCallback(() => api.get('/committees'), [api]);

  const createCommittee = useCallback((payload = {}) => api.post('/committees', payload), [api]);

  const getCommittee = useCallback((committeeId) => {
    if (!committeeId) throw new Error('committeeId is required');
    return api.get(withId(committeeId));
  }, [api]);

  const updateCommittee = useCallback((committeeId, payload = {}) => {
    if (!committeeId) throw new Error('committeeId is required');
    return api.patch(withId(committeeId), payload);
  }, [api]);

  return {
    listCommittees,
    createCommittee,
    getCommittee,
    updateCommittee,
  };
};
