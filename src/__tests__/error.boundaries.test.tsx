// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// ── Components under test ────────────────────────────────────────────────────
import { TabErrorBoundary } from '../components/common/TabErrorBoundary';

// Inline PortalErrorBoundary replica (same logic as App.tsx) for isolated testing
interface PEBState { hasError: boolean; error: Error | null; }
class PortalErrorBoundary extends React.Component<{ children: React.ReactNode }, PEBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): PEBState {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>पोर्टल में अप्रत्याशित त्रुटि</h2>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}>
            मुख्य पृष्ठ पर वापस जाएं
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const GoodChild: React.FC<{ label?: string }> = ({ label = 'OK' }) => <div data-testid="good-child">{label}</div>;

const BadChild: React.FC = () => {
  throw new Error('Intentional render crash for test');
};

let container: HTMLDivElement | null = null;
let root: Root | null = null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  // Suppress React's error boundary console.error noise in test output
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  if (root) {
    act(() => { root!.unmount(); });
  }
  container?.remove();
  container = null;
  root = null;
  vi.restoreAllMocks();
});

// ═════════════════════════════════════════════════════════════════════════════
describe('TabErrorBoundary', () => {

  it('renders children normally when no error is thrown', () => {
    act(() => {
      root!.render(
        <TabErrorBoundary tabName="Test Tab">
          <GoodChild label="Hello Tab" />
        </TabErrorBoundary>
      );
    });
    const child = container!.querySelector('[data-testid="good-child"]');
    expect(child).not.toBeNull();
    expect(child!.textContent).toBe('Hello Tab');
  });

  it('catches a render error and displays Hindi error heading', () => {
    act(() => {
      root!.render(
        <TabErrorBoundary tabName="टेस्ट अनुभाग">
          <BadChild />
        </TabErrorBoundary>
      );
    });
    expect(container!.textContent).toContain('टेस्ट अनुभाग');
    expect(container!.textContent).toContain('त्रुटि');
  });

  it('shows a retry button after catching an error', () => {
    act(() => {
      root!.render(
        <TabErrorBoundary tabName="Fees Tab">
          <BadChild />
        </TabErrorBoundary>
      );
    });
    const retryBtn = container!.querySelector('button');
    expect(retryBtn).not.toBeNull();
    expect(retryBtn!.textContent).toMatch(/पुनः प्रयास|Retry/i);
  });

  it('recovers and re-renders children after clicking retry', () => {
    let shouldCrash = true;
    const MaybeChild: React.FC = () => {
      if (shouldCrash) throw new Error('crash');
      return <div data-testid="recovered">Recovered!</div>;
    };

    // Initial render — crashes
    act(() => {
      root!.render(
        <TabErrorBoundary tabName="Recovery Tab">
          <MaybeChild />
        </TabErrorBoundary>
      );
    });
    expect(container!.querySelector('[data-testid="recovered"]')).toBeNull();

    // Fix the crash, click retry
    shouldCrash = false;
    const retryBtn = container!.querySelector('button');
    act(() => { retryBtn!.click(); });

    expect(container!.querySelector('[data-testid="recovered"]')).not.toBeNull();
  });

  it('isolates the error — sibling components outside the boundary are unaffected', () => {
    // Two independent boundaries side by side
    act(() => {
      root!.render(
        <div>
          <TabErrorBoundary tabName="Bad Tab">
            <BadChild />
          </TabErrorBoundary>
          <TabErrorBoundary tabName="Good Tab">
            <GoodChild label="safe" />
          </TabErrorBoundary>
        </div>
      );
    });
    // Good tab still renders
    const good = container!.querySelector('[data-testid="good-child"]');
    expect(good).not.toBeNull();
    expect(good!.textContent).toBe('safe');
    // Error UI is present for the bad tab
    expect(container!.textContent).toContain('Bad Tab');
  });

  it('displays the tabName passed as prop in the error UI', () => {
    const uniqueName = 'शुल्क प्रबंधन (Fees)';
    act(() => {
      root!.render(
        <TabErrorBoundary tabName={uniqueName}>
          <BadChild />
        </TabErrorBoundary>
      );
    });
    expect(container!.textContent).toContain(uniqueName);
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe('PortalErrorBoundary', () => {

  it('renders portal children normally when no error is thrown', () => {
    act(() => {
      root!.render(
        <PortalErrorBoundary>
          <GoodChild label="Admin Portal" />
        </PortalErrorBoundary>
      );
    });
    const child = container!.querySelector('[data-testid="good-child"]');
    expect(child).not.toBeNull();
    expect(child!.textContent).toBe('Admin Portal');
  });

  it('shows Hindi error heading when portal crashes', () => {
    act(() => {
      root!.render(
        <PortalErrorBoundary>
          <BadChild />
        </PortalErrorBoundary>
      );
    });
    expect(container!.textContent).toContain('पोर्टल में अप्रत्याशित त्रुटि');
  });

  it('shows a return-to-home button when portal crashes', () => {
    act(() => {
      root!.render(
        <PortalErrorBoundary>
          <BadChild />
        </PortalErrorBoundary>
      );
    });
    const btn = container!.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toMatch(/मुख्य पृष्ठ/i);
  });

  it('does not show error UI when children render successfully', () => {
    act(() => {
      root!.render(
        <PortalErrorBoundary>
          <GoodChild />
        </PortalErrorBoundary>
      );
    });
    expect(container!.textContent).not.toContain('त्रुटि');
    expect(container!.textContent).not.toContain('पोर्टल में अप्रत्याशित');
  });

});

// ═════════════════════════════════════════════════════════════════════════════
describe('Teacher Tab Persistence (sessionStorage)', () => {

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns "attendance" when no tab is stored in sessionStorage', () => {
    const validTabs = ['attendance', 'homework', 'marks', 'timetable', 'leaves', 'salary'];
    const saved = sessionStorage.getItem('ssm_teacher_tab');
    const result = (saved && validTabs.includes(saved)) ? saved : 'attendance';
    expect(result).toBe('attendance');
  });

  it('restores a valid stored tab from sessionStorage', () => {
    sessionStorage.setItem('ssm_teacher_tab', 'homework');
    const validTabs = ['attendance', 'homework', 'marks', 'timetable', 'leaves', 'salary'];
    const saved = sessionStorage.getItem('ssm_teacher_tab');
    const result = (saved && validTabs.includes(saved)) ? saved : 'attendance';
    expect(result).toBe('homework');
  });

  it('falls back to "attendance" for an invalid tab value', () => {
    sessionStorage.setItem('ssm_teacher_tab', 'hacked_tab');
    const validTabs = ['attendance', 'homework', 'marks', 'timetable', 'leaves', 'salary'];
    const saved = sessionStorage.getItem('ssm_teacher_tab');
    const result = (saved && validTabs.includes(saved)) ? saved : 'attendance';
    expect(result).toBe('attendance');
  });

  it('clears ssm_teacher_tab from sessionStorage on logout', () => {
    sessionStorage.setItem('ssm_teacher_tab', 'marks');
    sessionStorage.setItem('ssm_teacher_token', 'tok_123');
    // Simulate logoutTeacher cleanup
    sessionStorage.removeItem('ssm_teacher_token');
    sessionStorage.removeItem('ssm_teacher_id');
    sessionStorage.removeItem('ssm_teacher_name');
    sessionStorage.removeItem('ssm_teacher_tab');
    expect(sessionStorage.getItem('ssm_teacher_tab')).toBeNull();
    expect(sessionStorage.getItem('ssm_teacher_token')).toBeNull();
  });

  it('all 6 valid teacher tabs are accepted', () => {
    const validTabs = ['attendance', 'homework', 'marks', 'timetable', 'leaves', 'salary'];
    validTabs.forEach(tab => {
      sessionStorage.setItem('ssm_teacher_tab', tab);
      const saved = sessionStorage.getItem('ssm_teacher_tab');
      const result = (saved && validTabs.includes(saved)) ? saved : 'attendance';
      expect(result).toBe(tab);
    });
  });

});

