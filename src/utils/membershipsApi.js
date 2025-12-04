import { useCallback, useMemo } from 'react';
import { useApi } from './apiClient';

const requireCommitteeId = (committeeId) => {
  if (!committeeId) throw new Error('committeeId is required');
};

export const useMembershipsApi = (committeeId) => {
  const api = useApi();
  const basePath = useMemo(() => (committeeId ? `/committees/${committeeId}` : null), [committeeId]);

  const listMembers = useCallback(() => {
    requireCommitteeId(committeeId);
    return api.get(`${basePath}/member`);
  }, [api, basePath, committeeId]);

  const addMember = useCallback(
    (payload) => {
      requireCommitteeId(committeeId);
      return api.post(`${basePath}/member`, payload);
    },
    [api, basePath, committeeId]
  );

  const removeMember = useCallback(
    (payload) => {
      requireCommitteeId(committeeId);
      return api.delete(`${basePath}/member`, payload);
    },
    [api, basePath, committeeId]
  );

  const updateMemberRole = useCallback(
    (payload) => {
      requireCommitteeId(committeeId);
      return api.patch(`${basePath}/member`, payload);
    },
    [api, basePath, committeeId]
  );

  return {
    listMembers,
    addMember,
    removeMember,
    updateMemberRole,
  };
};
