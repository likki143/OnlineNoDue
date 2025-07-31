// Settings store for managing system-wide configuration
// In production, this would sync with Firebase or another backend

export interface SystemSettings {
  institutionName: string;
  academicYear: string;
  applicationDeadline: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoApprovalAlerts: boolean;
  sessionTimeout: number;
  forcePasswordReset: boolean;
  twoFactorAuth: boolean;
  certificateTemplate: string;
  includeQrCode: boolean;
  digitalSignature: boolean;
}

class SettingsStore {
  private readonly SETTINGS_KEY = "noDue_settings";

  // Default settings
  private defaultSettings: SystemSettings = {
    institutionName: "Sample University",
    academicYear: "2023-2024",
    applicationDeadline: 30,
    emailNotifications: true,
    smsNotifications: false,
    autoApprovalAlerts: true,
    sessionTimeout: 30,
    forcePasswordReset: false,
    twoFactorAuth: false,
    certificateTemplate: "default",
    includeQrCode: true,
    digitalSignature: true,
  };

  // Get all settings
  getSettings(): SystemSettings {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields are present
        return { ...this.defaultSettings, ...parsed };
      } catch (error) {
        console.error("Error parsing stored settings:", error);
        return this.defaultSettings;
      }
    }
    return this.defaultSettings;
  }

  // Update settings
  updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    // Dispatch custom event to notify components of settings change
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: updatedSettings }));
    
    return updatedSettings;
  }

  // Reset to defaults
  resetToDefaults(): SystemSettings {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.defaultSettings));
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: this.defaultSettings }));
    return this.defaultSettings;
  }

  // Get specific setting
  getSetting<K extends keyof SystemSettings>(key: K): SystemSettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }

  // Update specific setting
  updateSetting<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): SystemSettings {
    return this.updateSettings({ [key]: value });
  }

  // Subscribe to settings changes
  onSettingsChange(callback: (settings: SystemSettings) => void): () => void {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener('settingsUpdated', handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('settingsUpdated', handler as EventListener);
    };
  }
}

export const settingsStore = new SettingsStore();
