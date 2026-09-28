import { resolveWorkspaceId } from '../src/utils/workspaceUtils';

describe('workspace routing', () => {
  it('routes father to the shared workspace', () => {
    expect(resolveWorkspaceId('father-uid', 'father')).toBe('father-son');
  });

  it('routes son to the shared workspace', () => {
    expect(resolveWorkspaceId('son-uid', 'son')).toBe('father-son');
  });

  it('routes other valid roles to the authenticated user private workspace', () => {
    expect(resolveWorkspaceId('pending-uid', 'pending')).toBe('private-pending-uid');
  });

  it('keeps private workspaces isolated by UID', () => {
    expect(resolveWorkspaceId('first-uid', 'pending')).not.toBe(
      resolveWorkspaceId('second-uid', 'pending')
    );
  });

  it('gives father and son the same workspace for Modules 2 and 3', () => {
    expect(resolveWorkspaceId('father-uid', 'father')).toBe(
      resolveWorkspaceId('son-uid', 'son')
    );
  });

  it('does not use a profile workspace field as the routing source', () => {
    expect(resolveWorkspaceId('user-uid', null)).toBe('private-user-uid');
  });
});