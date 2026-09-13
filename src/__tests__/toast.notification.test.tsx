// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastContainer } from '../components/common/ToastContainer';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

// Test consumer component
const TestConsumer: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo, removeToast, clearAllToasts, toasts } = useToast();

  return (
    <div>
      <span data-testid="toast-count">{toasts.length}</span>
      <button data-testid="btn-success" onClick={() => showSuccess('कार्य सफल!')}>Success</button>
      <button data-testid="btn-error" onClick={() => showError('गंभीर त्रुटि!')}>Error</button>
      <button data-testid="btn-warning" onClick={() => showWarning('कृपया ध्यान दें!')}>Warning</button>
      <button data-testid="btn-info" onClick={() => showInfo('नवीन सूचना!')}>Info</button>
      <button data-testid="btn-clear" onClick={() => clearAllToasts()}>Clear All</button>
      {toasts.map(t => (
        <button key={t.id} data-testid={`btn-remove-${t.id}`} onClick={() => removeToast(t.id)}>
          Remove-{t.id}
        </button>
      ))}
    </div>
  );
};

describe('Toast Notification System Suite', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root!.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  it('initializes with zero toasts', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const countEl = container!.querySelector('[data-testid="toast-count"]');
    expect(countEl?.textContent).toBe('0');
  });

  it('adds and displays a success toast with correct role and message', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const btn = container!.querySelector('[data-testid="btn-success"]') as HTMLButtonElement;
    act(() => {
      btn.click();
    });

    const countEl = container!.querySelector('[data-testid="toast-count"]');
    expect(countEl?.textContent).toBe('1');
    expect(container!.textContent).toContain('कार्य सफल!');
    const statusEl = container!.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
  });

  it('adds and displays an error toast with role="alert"', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const btn = container!.querySelector('[data-testid="btn-error"]') as HTMLButtonElement;
    act(() => {
      btn.click();
    });

    expect(container!.textContent).toContain('गंभीर त्रुटि!');
    const alertEl = container!.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
  });

  it('adds warning and info toasts correctly', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const btnWarn = container!.querySelector('[data-testid="btn-warning"]') as HTMLButtonElement;
    const btnInfo = container!.querySelector('[data-testid="btn-info"]') as HTMLButtonElement;

    act(() => {
      btnWarn.click();
      btnInfo.click();
    });

    expect(container!.textContent).toContain('कृपया ध्यान दें!');
    expect(container!.textContent).toContain('नवीन सूचना!');
  });

  it('clears all active toasts via clearAllToasts', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const btnSuccess = container!.querySelector('[data-testid="btn-success"]') as HTMLButtonElement;
    const btnClear = container!.querySelector('[data-testid="btn-clear"]') as HTMLButtonElement;

    act(() => {
      btnSuccess.click();
      btnSuccess.click();
    });

    const countEl = container!.querySelector('[data-testid="toast-count"]');
    expect(countEl?.textContent).toBe('2');

    act(() => {
      btnClear.click();
    });

    expect(countEl?.textContent).toBe('0');
  });

  it('limits concurrent toasts to at most 5 items', () => {
    act(() => {
      root!.render(
        <ToastProvider>
          <TestConsumer />
          <ToastContainer />
        </ToastProvider>
      );
    });

    const btnSuccess = container!.querySelector('[data-testid="btn-success"]') as HTMLButtonElement;

    act(() => {
      for (let i = 0; i < 8; i++) {
        btnSuccess.click();
      }
    });

    const countEl = container!.querySelector('[data-testid="toast-count"]');
    const count = parseInt(countEl?.textContent || '0', 10);
    expect(count).toBeLessThanOrEqual(5);
  });

  it('provides safe no-op fallback methods when used outside ToastProvider', () => {
    let capturedHook: ReturnType<typeof useToast> | null = null;
    const OrphanComponent: React.FC = () => {
      capturedHook = useToast();
      return null;
    };

    act(() => {
      root!.render(<OrphanComponent />);
    });

    expect(capturedHook).not.toBeNull();
    expect(capturedHook!.toasts).toEqual([]);
    expect(() => {
      capturedHook!.showSuccess('test');
      capturedHook!.showError('test');
      capturedHook!.showWarning('test');
      capturedHook!.showInfo('test');
      capturedHook!.removeToast('1');
      capturedHook!.clearAllToasts();
    }).not.toThrow();
  });
});
