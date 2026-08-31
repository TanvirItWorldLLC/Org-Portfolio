'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Settings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: string;
  emailNewOrder: string;
  emailOrderUpdates: string;
  emailNewUser: string;
  twoFactorAuth: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  apiRateLimit: number;
  apiEnabled: string;
  maintenanceMode: string;
  logRetention: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setSettings(d.settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!r.ok) throw new Error();
      toast.success('Settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-12 bg-dark-100 dark:bg-dark-800 rounded" />)}</div>;
  if (!settings) return <div className="text-center text-dark-500">Failed to load settings.</div>;

  const u = (k: keyof Settings) => (v: string | number) => setSettings({ ...settings, [k]: v } as Settings);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Settings</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Configure your portfolio platform</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-semibold border-b border-dark-200 dark:border-dark-700 pb-3">Site</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Site Name</label><input className="input" value={settings.siteName} onChange={(e) => u('siteName')(e.target.value)} /></div>
          <div><label className="label">Contact Email</label><input type="email" className="input" value={settings.contactEmail || ''} onChange={(e) => u('contactEmail')(e.target.value)} /></div>
          <div className="md:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={settings.siteDescription || ''} onChange={(e) => u('siteDescription')(e.target.value)} /></div>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-semibold border-b border-dark-200 dark:border-dark-700 pb-3">Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="label">Primary Color</label><input type="color" className="input h-12 p-1" value={settings.primaryColor} onChange={(e) => u('primaryColor')(e.target.value)} /></div>
          <div><label className="label">Secondary Color</label><input type="color" className="input h-12 p-1" value={settings.secondaryColor} onChange={(e) => u('secondaryColor')(e.target.value)} /></div>
          <div>
            <label className="label">Dark Mode</label>
            <select className="input" value={settings.darkMode} onChange={(e) => u('darkMode')(e.target.value)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-semibold border-b border-dark-200 dark:border-dark-700 pb-3">Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Session Timeout (minutes)</label><input type="number" className="input" value={settings.sessionTimeout} onChange={(e) => u('sessionTimeout')(Number(e.target.value))} /></div>
          <div><label className="label">Max Login Attempts</label><input type="number" className="input" value={settings.maxLoginAttempts} onChange={(e) => u('maxLoginAttempts')(Number(e.target.value))} /></div>
          <div><label className="label">Password Min Length</label><input type="number" className="input" value={settings.passwordMinLength} onChange={(e) => u('passwordMinLength')(Number(e.target.value))} /></div>
          <div>
            <label className="label">2FA</label>
            <select className="input" value={settings.twoFactorAuth} onChange={(e) => u('twoFactorAuth')(e.target.value)}>
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <h2 className="text-xl font-semibold border-b border-dark-200 dark:border-dark-700 pb-3">Notifications</h2>
        <div className="space-y-3">
          {[
            ['emailNewOrder', 'Email on new order'],
            ['emailOrderUpdates', 'Email on order updates'],
            ['emailNewUser', 'Email on new user registration'],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center gap-3">
              <input type="checkbox" checked={settings[k as keyof Settings] === 'true'} onChange={(e) => u(k as keyof Settings)(e.target.checked ? 'true' : 'false')} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-6 border-2 border-yellow-500/50">
        <h2 className="text-xl font-semibold border-b border-dark-200 dark:border-dark-700 pb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Maintenance
        </h2>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.maintenanceMode === 'true'} onChange={(e) => u('maintenanceMode')(e.target.checked ? 'true' : 'false')} />
          <span className="text-sm">Enable maintenance mode (site becomes read-only)</span>
        </label>
        <div><label className="label">Log Retention (days)</label><input type="number" className="input max-w-xs" value={settings.logRetention} onChange={(e) => u('logRetention')(Number(e.target.value))} /></div>
      </div>
    </div>
  );
}