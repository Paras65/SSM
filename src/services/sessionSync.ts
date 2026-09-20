/**
 * Cross-tab session synchronization service for SSM ERP.
 * 
 * Securely synchronizes active in-memory sessions across multiple browser tabs
 * of the same school without persisting sensitive tokens into localStorage.
 * Uses the standard Web BroadcastChannel API with graceful fallback.
 */

const CHANNEL_NAME = 'ssm_tab_session_sync';

interface SessionData {
  adminToken?: string | null;
  adminAuth?: string | null;
  adminRole?: string | null;
  adminSchoolId?: string | null;
  teacherToken?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  teacherSchoolId?: string | null;
  sankulToken?: string | null;
  sankulName?: string | null;
}

type SyncMessage = 
  | { type: 'REQUEST_SESSION' }
  | { type: 'SHARE_SESSION'; session: SessionData }
  | { type: 'LOGOUT_ROLE'; role: 'admin' | 'teacher' | 'sankul' | 'all' };

class SessionSyncManager {
  private channel: BroadcastChannel | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.setupListener();
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[SessionSync] BroadcastChannel unsupported/failed:', err);
      }
    }
  }

  private setupListener() {
    if (!this.channel) return;

    this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const msg = event.data;
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'REQUEST_SESSION':
          // Existing active tab replies with its current session
          this.broadcastCurrentSession();
          break;

        case 'SHARE_SESSION':
          // Newly opened tab receives active session and writes to its own sessionStorage
          this.applySharedSession(msg.session);
          break;

        case 'LOGOUT_ROLE':
          // Another tab logged out; purge corresponding role in this tab
          this.handleRemoteLogout(msg.role);
          break;
      }
    };
  }

  private getCurrentSession(): SessionData {
    if (typeof window === 'undefined') return {};
    return {
      adminToken: sessionStorage.getItem('ssm_admin_token'),
      adminAuth: sessionStorage.getItem('ssm_admin_authenticated'),
      adminRole: sessionStorage.getItem('ssm_admin_role'),
      adminSchoolId: sessionStorage.getItem('ssm_admin_school_id'),
      teacherToken: sessionStorage.getItem('ssm_teacher_token'),
      teacherId: sessionStorage.getItem('ssm_teacher_id'),
      teacherName: sessionStorage.getItem('ssm_teacher_name'),
      teacherSchoolId: sessionStorage.getItem('ssm_teacher_school_id'),
      sankulToken: sessionStorage.getItem('ssm_sankul_token'),
      sankulName: sessionStorage.getItem('ssm_sankul_name')
    };
  }

  public broadcastCurrentSession() {
    if (!this.channel) return;
    const session = this.getCurrentSession();
    const hasAnySession = session.adminToken || session.teacherToken || session.sankulToken;
    if (hasAnySession) {
      this.channel.postMessage({ type: 'SHARE_SESSION', session });
    }
  }

  private applySharedSession(session: SessionData) {
    if (typeof window === 'undefined' || !session) return;

    let updated = false;

    if (session.adminToken && !sessionStorage.getItem('ssm_admin_token')) {
      sessionStorage.setItem('ssm_admin_token', session.adminToken);
      if (session.adminAuth) sessionStorage.setItem('ssm_admin_authenticated', session.adminAuth);
      if (session.adminRole) sessionStorage.setItem('ssm_admin_role', session.adminRole);
      if (session.adminSchoolId) sessionStorage.setItem('ssm_admin_school_id', session.adminSchoolId);
      updated = true;
    }

    if (session.teacherToken && !sessionStorage.getItem('ssm_teacher_token')) {
      sessionStorage.setItem('ssm_teacher_token', session.teacherToken);
      if (session.teacherId) sessionStorage.setItem('ssm_teacher_id', session.teacherId);
      if (session.teacherName) sessionStorage.setItem('ssm_teacher_name', session.teacherName);
      if (session.teacherSchoolId) sessionStorage.setItem('ssm_teacher_school_id', session.teacherSchoolId);
      updated = true;
    }

    if (session.sankulToken && !sessionStorage.getItem('ssm_sankul_token')) {
      sessionStorage.setItem('ssm_sankul_token', session.sankulToken);
      if (session.sankulName) sessionStorage.setItem('ssm_sankul_name', session.sankulName);
      updated = true;
    }

    if (updated) {
      window.dispatchEvent(new CustomEvent('ssm_session_synced'));
    }
  }

  private handleRemoteLogout(role: 'admin' | 'teacher' | 'sankul' | 'all') {
    if (typeof window === 'undefined') return;

    if (role === 'admin' || role === 'all') {
      sessionStorage.removeItem('ssm_admin_token');
      sessionStorage.removeItem('ssm_admin_authenticated');
      sessionStorage.removeItem('ssm_admin_role');
      sessionStorage.removeItem('ssm_admin_school_id');
    }

    if (role === 'teacher' || role === 'all') {
      sessionStorage.removeItem('ssm_teacher_token');
      sessionStorage.removeItem('ssm_teacher_id');
      sessionStorage.removeItem('ssm_teacher_name');
      sessionStorage.removeItem('ssm_teacher_tab');
      sessionStorage.removeItem('ssm_teacher_school_id');
    }

    if (role === 'sankul' || role === 'all') {
      sessionStorage.removeItem('ssm_sankul_token');
      sessionStorage.removeItem('ssm_sankul_name');
    }

    window.dispatchEvent(new CustomEvent('ssm_remote_logout', { detail: { role } }));
  }

  /**
   * Broadcast logout event to all other tabs
   */
  public broadcastLogout(role: 'admin' | 'teacher' | 'sankul' | 'all') {
    if (!this.channel) return;
    try {
      this.channel.postMessage({ type: 'LOGOUT_ROLE', role });
    } catch {}
  }

  /**
   * Called on initial page load to request session from any sibling tabs
   */
  public init() {
    if (this.isInitialized || !this.channel) return;
    this.isInitialized = true;

    // If this tab already has no tokens, ask other tabs if they have one
    const session = this.getCurrentSession();
    if (!session.adminToken && !session.teacherToken && !session.sankulToken) {
      this.channel.postMessage({ type: 'REQUEST_SESSION' });
    }
  }
}

export const sessionSync = new SessionSyncManager();

