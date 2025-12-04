import { useCallback } from 'react';
import { useApi } from './apiClient';

const committeeMotionsPath = (committeeId) => `/committees/${encodeURIComponent(committeeId)}/motions`;
const motionPath = (motionId) => `/motions/motions/${encodeURIComponent(motionId)}`;
const motionDebatesPath = (motionId) => `/motions/motions/${encodeURIComponent(motionId)}/debate`;

export const useMotionsApi = () => {
  const api = useApi();

  const listMotions = useCallback((committeeId) => {
    if (!committeeId) throw new Error('committeeId is required');
    return api.get(committeeMotionsPath(committeeId));
  }, [api]);

  const createMotion = useCallback((committeeId, payload = {}) => {
    if (!committeeId) throw new Error('committeeId is required');
    return api.post(committeeMotionsPath(committeeId), payload);
  }, [api]);

  const getMotion = useCallback((motionId) => {
    if (!motionId) throw new Error('motionId is required');
    return api.get(motionPath(motionId));
  }, [api]);

  const listDebates = useCallback((motionId) => {
    if (!motionId) throw new Error('motionId is required');
    return api.get(motionDebatesPath(motionId));
  }, [api]);

  const createDebate = useCallback((motionId, payload = {}) => {
    if (!motionId) throw new Error('motionId is required');
    return api.post(motionDebatesPath(motionId), payload);
  }, [api]);

  return {
    listMotions,
    createMotion,
    getMotion,
    listDebates,
    createDebate,
  };
};
