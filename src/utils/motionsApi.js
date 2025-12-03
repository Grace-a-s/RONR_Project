import { useCallback } from 'react';
import { useApi } from './apiClient';

const BASE = '/motions';
const committeeMotionsPath = (committeeId) => `${BASE}/committees/${encodeURIComponent(committeeId)}/motions`;
const motionPath = (motionId) => `${BASE}/motions/${encodeURIComponent(motionId)}`;

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

  return {
    listMotions,
    createMotion,
    getMotion,
  };
};
