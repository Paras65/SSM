// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { SchoolProvider, useSchool, DEMO_SANDBOX_SCHOOL } from '../context/SchoolContext';
import { LanguageProvider, useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { TCVerificationModal } from '../components/public/TCVerificationModal';
import { AlumniRegistrationModal } from '../components/public/AlumniRegistrationModal';
import { DemoBanner } from '../components/common/DemoBanner';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  nativeInputValueSetter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('SSM ERP High-Impact Enhancements Suite', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  describe('1. Demo Sandbox Mode Engine', () => {
    it('has full pro capabilities and authentic Vidya Bharati metadata for DEMO_SANDBOX_SCHOOL', () => {
      expect(DEMO_SANDBOX_SCHOOL.plan).toBe('pro');
      expect(DEMO_SANDBOX_SCHOOL.id).toBe('ssm-demo');
      expect(DEMO_SANDBOX_SCHOOL.hindiName).toContain('लाइव डेमो');
      expect(DEMO_SANDBOX_SCHOOL.affiliate).toContain('विद्या भारती');
    });

    it('activates demo mode, elevates view to admin, and exits cleanly back to public', () => {
      let consumerRef: any = null;

      const TestConsumer = () => {
        const schoolCtx = useSchool();
        consumerRef = schoolCtx;
        return (
          <div>
            <div id="is-demo">{schoolCtx.isDemoMode ? 'yes' : 'no'}</div>
            <div id="view-mode">{schoolCtx.viewMode}</div>
            <div id="school-id">{schoolCtx.currentSchool.id}</div>
            <div id="pro-allowed">{schoolCtx.isFeatureAllowed('reports_patra') ? 'allowed' : 'denied'}</div>
          </div>
        );
      };

      act(() => {
        root?.render(
          <SchoolProvider>
            <TestConsumer />
          </SchoolProvider>
        );
      });

      expect(container?.querySelector('#is-demo')?.textContent).toBe('no');
      expect(container?.querySelector('#view-mode')?.textContent).toBe('public');

      // Start Demo
      act(() => {
        consumerRef.startDemoMode();
      });

      expect(container?.querySelector('#is-demo')?.textContent).toBe('yes');
      expect(container?.querySelector('#view-mode')?.textContent).toBe('admin');
      expect(container?.querySelector('#school-id')?.textContent).toBe('ssm-demo');
      expect(container?.querySelector('#pro-allowed')?.textContent).toBe('allowed');
      expect(sessionStorage.getItem('ssm_is_demo')).toBe('true');
      expect(sessionStorage.getItem('ssm_admin_token')).toBe('demo_session_token_1952');

      // Exit Demo
      act(() => {
        consumerRef.exitDemoMode();
      });

      expect(container?.querySelector('#is-demo')?.textContent).toBe('no');
      expect(container?.querySelector('#view-mode')?.textContent).toBe('public');
      expect(sessionStorage.getItem('ssm_is_demo')).toBeNull();
      expect(sessionStorage.getItem('ssm_admin_token')).toBeNull();
    });

    it('renders DemoBanner only when demo mode is active', () => {
      let consumerRef: any = null;

      const TestApp = () => {
        const schoolCtx = useSchool();
        consumerRef = schoolCtx;
        return (
          <div>
            <DemoBanner />
          </div>
        );
      };

      act(() => {
        root?.render(
          <SchoolProvider>
            <TestApp />
          </SchoolProvider>
        );
      });

      expect(container?.textContent).not.toContain('लाइव सैंडबॉक्स');

      // Trigger demo
      act(() => {
        consumerRef.startDemoMode();
      });

      expect(container?.textContent).toContain('लाइव सैंडबॉक्स');
      expect(container?.textContent).toContain('डेमो बंद करें');
    });
  });

  describe('2. Public Online TC Verification', () => {
    it('successfully matches and displays verified certificate for valid roll number using quick chip', () => {
      act(() => {
        root?.render(
          <SchoolProvider>
            <TCVerificationModal isOpen={true} onClose={() => {}} />
          </SchoolProvider>
        );
      });

      // Find quick sample chip button
      const buttons = Array.from(container?.querySelectorAll('button') || []);
      const sampleChip = buttons.find(b => b.textContent?.includes('Aryan Sharma') || b.textContent?.includes('101'));
      expect(sampleChip).toBeDefined();

      act(() => {
        sampleChip?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container?.textContent).toContain('सत्यापित एवं मान्य अभिलेख');
      expect(container?.textContent).toContain('श्रेष्ठ (Excellent)');
    });

    it('displays clear not found alert when an unknown TC number is searched', () => {
      act(() => {
        root?.render(
          <SchoolProvider>
            <TCVerificationModal isOpen={true} onClose={() => {}} />
          </SchoolProvider>
        );
      });

      const input = container?.querySelector('input') as HTMLInputElement;
      act(() => {
        setInputValue(input, 'UNKNOWN-TC-999999');
      });

      const buttons = Array.from(container?.querySelectorAll('button') || []);
      const verifyBtn = buttons.find(b => b.textContent?.includes('सत्यापित करें'));

      act(() => {
        verifyBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container?.textContent).toContain('कोई अभिलेख प्राप्त नहीं हुआ');
    });
  });

  describe('3. Purva Chhatra (Alumni) Portal Registration', () => {
    it('registers an alumnus and stores record into localStorage', () => {
      act(() => {
        root?.render(
          <SchoolProvider>
            <ToastProvider>
              <AlumniRegistrationModal isOpen={true} onClose={() => {}} />
            </ToastProvider>
          </SchoolProvider>
        );
      });

      const inputs = Array.from(container?.querySelectorAll('input') || []);
      const nameInput = inputs[0];
      const phoneInput = inputs.find(i => i.getAttribute('type') === 'tel') || inputs[5];

      act(() => {
        if (nameInput) setInputValue(nameInput, 'अभिषेक त्रिपाठी');
        if (phoneInput) setInputValue(phoneInput, '+91 9988776655');
      });

      const form = container?.querySelector('form');
      act(() => {
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      expect(container?.textContent).toContain('अभिनंदन, भैया/बहिन!');
      expect(container?.textContent).toContain('VB-ALUMNI-');

      const stored = localStorage.getItem('ssm_alumni_list');
      expect(stored).not.toBeNull();
      const list = JSON.parse(stored || '[]');
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('अभिषेक त्रिपाठी');
    });
  });

  describe('4. Multilingual & Regional Language Support', () => {
    it('contains all required regional Vidya Bharati languages', () => {
      const codes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(codes).toContain('hi');
      expect(codes).toContain('en');
      expect(codes).toContain('sa');
      expect(codes).toContain('bn');
      expect(codes).toContain('gu');
      expect(codes).toContain('or');
    });

    it('translates navigation terms and falls back smoothly to Hindi for missing keys', () => {
      let langCtx: any = null;

      const LangConsumer = () => {
        langCtx = useLanguage();
        return (
          <div>
            <div id="current-lang">{langCtx.language}</div>
            <div id="translated-home">{langCtx.t('navHome')}</div>
            <div id="translated-panchmukhi">{langCtx.t('navPanchmukhi')}</div>
          </div>
        );
      };

      act(() => {
        root?.render(
          <LanguageProvider>
            <LangConsumer />
          </LanguageProvider>
        );
      });

      expect(container?.querySelector('#translated-home')?.textContent).toBe('मुख्य पृष्ठ');

      // Switch to Sanskrit
      act(() => {
        langCtx.setLanguage('sa');
      });
      expect(container?.querySelector('#translated-home')?.textContent).toBe('मुख्यपृष्ठम्');
      expect(container?.querySelector('#translated-panchmukhi')?.textContent).toBe('पञ्चमुखी शिक्षा');

      // Switch to Gujarati
      act(() => {
        langCtx.setLanguage('gu');
      });
      expect(container?.querySelector('#translated-home')?.textContent).toBe('મુખ્ય પૃષ્ઠ');
    });
  });
});
