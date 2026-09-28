import { UserRole } from '../types/auth';
import { WORKSPACE_CONFIG } from '../constants/config';

export const resolveWorkspaceId = (uid: string, role: UserRole | null): string => {
  if (role === 'father' || role === 'son') {
    return WORKSPACE_CONFIG.fatherSonId;
  }

  return `${WORKSPACE_CONFIG.privatePrefix}${uid}`;
};