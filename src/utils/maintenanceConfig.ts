/**
 * Maintenance & Downtime Notification Configuration
 * Manages scheduled maintenance notices and full-page maintenance mode.
 */

export interface MaintenanceConfig {
  /** When true, shows full-page maintenance screen blocking regular portal access */
  enabled: boolean;
  /** When true, shows a top notice banner informing users of upcoming scheduled downtime */
  scheduledNotice: boolean;
  /** Primary title of the maintenance window */
  title: string;
  /** Detailed operational description in Hindi */
  message: string;
  /** Time window of the scheduled maintenance */
  scheduledWindow: string;
  /** Estimated time of completion/restoration */
  estimatedEnd: string;
  /** Support helpline phone or email */
  supportContact: string;
}

const STORAGE_KEY = 'ssm_maintenance_override';

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  enabled: false,
  scheduledNotice: false,
  title: 'सिस्टम अपग्रेड एवं सर्वर रखरखाव',
  message: 'विद्यालय ईआरपी प्रणाली को और अधिक द्रुतगामी एवं सुरक्षित बनाने हेतु आवश्यक तकनीकी उन्नयन प्रगति पर है।',
  scheduledWindow: 'आगामी रविवार, रात्रि 10:00 से 02:00 बजे तक',
  estimatedEnd: 'प्रातः 04:00 बजे तक',
  supportContact: '+91 98765 43210 | support@init65.co.in'
};

export function getMaintenanceConfig(): MaintenanceConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_MAINTENANCE_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore parse errors, fallback to default
  }
  return DEFAULT_MAINTENANCE_CONFIG;
}

export function setMaintenanceConfig(config: Partial<MaintenanceConfig>): void {
  try {
    const current = getMaintenanceConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('ssm_maintenance_updated'));
  } catch (err) {
    console.error('Failed to save maintenance config:', err);
  }
}

export function isMaintenanceBypassed(): boolean {
  if (typeof window === 'undefined') return false;
  // Admin session active
  if (sessionStorage.getItem('ssm_admin_token')) return true;
  // Query param emergency override
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('admin_bypass') === '1' || urlParams.get('bypass_maintenance') === '1';
}

