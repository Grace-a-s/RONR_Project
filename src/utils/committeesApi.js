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

  const updateVotingThreshold = useCallback((committeeId, votingThreshold) => {
    if (!committeeId) throw new Error('committeeId is required');
    if (!votingThreshold) throw new Error('votingThreshold is required');
    return api.patch(`${withId(committeeId)}/voting-threshold`, { votingThreshold });
  }, [api]);

  const updateAnonymousVoting = useCallback((committeeId, anonymousVoting) => {
    if (!committeeId) throw new Error('committeeId is required');
    if (typeof anonymousVoting !== 'boolean') throw new Error('anonymousVoting must be a boolean');
    return api.patch(`${withId(committeeId)}/anonymous-voting`, { anonymousVoting });
  }, [api]);

  return {
    listCommittees,
    createCommittee,
    getCommittee,
    updateCommittee,
    updateVotingThreshold,
    updateAnonymousVoting,
  };
};
