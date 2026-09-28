import { useAuth } from './useAuth';
import { resolveWorkspaceId } from '../utils/workspaceUtils';

export const useWorkspaceScope = () => {
  const { state } = useAuth();
  const uid = state.user?.uid ?? '';
  const verifiedRole = state.userProfile?.uid === uid ? state.userProfile.role : null;

  return {
    workspaceId: uid ? resolveWorkspaceId(uid, verifiedRole) : '',
  };
};