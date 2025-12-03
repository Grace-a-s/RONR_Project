import { useCallback, useMemo } from 'react';
import { useApi } from './apiClient';

const requireCommitteeId = (committeeId) => {
  if (!committeeId) throw new Error('committeeId is required');
};

export const useMembershipsApi = (committeeId) => {
  const api = useApi();
  const basePath = useMemo(() => (committeeId ? `/committees/${committeeId}` : null), [committeeId]);

  const listMembers = useCallback(() => {
    requireCommitteeId(basePath);
    return api.get(`${basePath}/member`);
  }, [api, basePath]);

  const addMember = useCallback(
    (payload) => {
      requireCommitteeId(basePath);
      return api.post(`${basePath}/member`, payload);
    },
    [api, basePath]
  );

  const removeMember = useCallback(
    (payload) => {
      requireCommitteeId(basePath);
      return api.delete(`${basePath}/member`, payload);
    },
    [api, basePath]
  );

  const updateMemberRole = useCallback(
    (payload) => {
      requireCommitteeId(basePath);
      return api.patch(`${basePath}/member`, payload);
    },
    [api, basePath]
  );

  return {
    listMembers,
    addMember,
    removeMember,
    updateMemberRole,
  };
};
