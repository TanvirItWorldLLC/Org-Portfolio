import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Eye, EyeOff, Bell, Shield, Palette, Globe, Database, Key } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Database },
  { id: 'advanced', label: 'Advanced', icon: Key },
]

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Org Portfolio',
      siteDescription: 'Creating immersive 3D digital experiences',
      siteUrl: 'https://orgportfolio.com',
      contactEmail: 'hello@orgportfolio.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false,
    },
    appearance: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#8b5cf6',
      darkMode: 'system',
      logo: '',
      favicon: '',
      customCSS: '',
    },
    notifications: {
      emailNewOrder: true,
      emailOrderUpdates: true,
      emailNewUser: true,
      emailWeeklyReport: false,
      slackWebhook: '',
      discordWebhook: '',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      apiRateLimit: 1000,
    },
    integrations: {
      googleAnalytics: '',
      googleTagManager: '',
      facebookPixel: '',
      hotjar: '',
      sentry: '',
      stripe: '',
      paypal: '',
    },
    advanced: {
      apiEnabled: true,
      webhooksEnabled: true,
      corsOrigins: 'https://orgportfolio.com',
      customHeaders: '',
      backupFrequency: 'daily',
      logRetention: 90,
    },
  })
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminAPI.getSettings()
        if (response.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.settings }))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])
  
  const handleSave = async () => {
    setSaving(true)
    try {
      await adminAPI.updateSettings(settings)
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChange = (tab, field, value) => {
    setSettings(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value }
    }))
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Settings</h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">Configure your portfolio platform</p>
          </div>
        </div>
        <div className="card p-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Settings</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Configure your portfolio platform</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </motion.div>
      
      <div className="card overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-dark-200 dark:border-dark-800 overflow-x-auto">
          <nav className="flex gap-1 px-4" role="tablist" aria-label="Settings tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:border-dark-200 dark:hover:border-dark-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && (
                <GeneralSettings settings={settings.general} onChange={(field, value) => handleChange('general', field, value)} />
              )}
              {activeTab === 'appearance' && (
                <AppearanceSettings settings={settings.appearance} onChange={(field, value) => handleChange('appearance', field, value)} />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings settings={settings.notifications} onChange={(field, value) => handleChange('notifications', field, value)} />
              )}
              {activeTab === 'security' && (
                <SecuritySettings settings={settings.security} onChange={(field, value) => handleChange('security', field, value)} showPassword={showPassword} setShowPassword={setShowPassword} />
              )}
              {activeTab === 'integrations' && (
                <IntegrationSettings settings={settings.integrations} onChange={(field, value) => handleChange('integrations', field, value)} />
              )}
              {activeTab === 'advanced' && (
                <AdvancedSettings settings={settings.advanced} onChange={(field, value) => handleChange('advanced', field, value)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ settings, onChange }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Site Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Site Name</label>
            <input type="text" value={settings.siteName} onChange={e => onChange('siteName', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Site URL</label>
            <input type="url" value={settings.siteUrl} onChange={e => onChange('siteUrl', e.target.value)} className="input" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Site Description</label>
            <textarea rows={3} value={settings.siteDescription} onChange={e => onChange('siteDescription', e.target.value)} className="input resize-none" />
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" value={settings.contactEmail} onChange={e => onChange('contactEmail', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select value={settings.timezone} onChange={e => onChange('timezone', e.target.value)} className="input">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Singapore">Singapore</option>
            </select>
          </div>
          <div>
            <label className="label">Default Language</label>
            <select value={settings.language} onChange={e => onChange('language', e.target.value)} className="input">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Maintenance Mode</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={e => onChange('maintenanceMode', e.target.checked)}
            className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <p className="font-medium text-dark-900 dark:text-white">Enable Maintenance Mode</p>
            <p className="text-sm text-dark-500 dark:text-dark-500">Shows a maintenance page to all non-admin visitors</p>
          </div>
        </label>
      </div>
    </div>
  )
}

function AppearanceSettings({ settings, onChange }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Color Scheme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Primary Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => onChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-dark-200 dark:border-dark-700 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={e => onChange('primaryColor', e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="label">Secondary Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={e => onChange('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-dark-200 dark:border-dark-700 cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={e => onChange('secondaryColor', e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Dark Mode Preference</label>
            <select value={settings.darkMode} onChange={e => onChange('darkMode', e.target.value)} className="input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Preference</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Brand Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Logo URL</label>
            <input type="url" value={settings.logo} onChange={e => onChange('logo', e.target.value)} className="input" placeholder="https://example.com/logo.svg" />
          </div>
          <div>
            <label className="label">Favicon URL</label>
            <input type="url" value={settings.favicon} onChange={e => onChange('favicon', e.target.value)} className="input" placeholder="https://example.com/favicon.ico" />
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Custom CSS</h3>
        <textarea
          rows={8}
          value={settings.customCSS}
          onChange={e => onChange('customCSS', e.target.value)}
          className="input resize-none font-mono text-sm"
          placeholder="/* Add custom CSS here */"
        />
      </div>
    </div>
  )
}

function NotificationSettings({ settings, onChange }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNewOrder', label: 'New Order Received', description: 'Notify when a new order is placed' },
            { key: 'emailOrderUpdates', label: 'Order Status Updates', description: 'Notify when order status changes' },
            { key: 'emailNewUser', label: 'New User Registration', description: 'Notify when a new user registers' },
            { key: 'emailWeeklyReport', label: 'Weekly Analytics Report', description: 'Receive weekly summary via email' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
              <div>
                <p className="font-medium text-dark-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-dark-500 dark:text-dark-500">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={e => onChange(item.key, e.target.checked)}
                className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          ))}
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Webhook Integrations</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Slack Webhook URL</label>
            <input type="url" value={settings.slackWebhook} onChange={e => onChange('slackWebhook', e.target.value)} className="input" placeholder="https://hooks.slack.com/services/..." />
            <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">Receive order notifications in Slack</p>
          </div>
          <div>
            <label className="label">Discord Webhook URL</label>
            <input type="url" value={settings.discordWebhook} onChange={e => onChange('discordWebhook', e.target.value)} className="input" placeholder="https://discord.com/api/webhooks/..." />
            <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">Receive order notifications in Discord</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ settings, onChange, showPassword, setShowPassword }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Authentication</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-dark-500 dark:text-dark-500">Require 2FA for admin accounts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={e => onChange('twoFactorAuth', e.target.checked)}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Email Verification Required</p>
              <p className="text-sm text-dark-500 dark:text-dark-500">Users must verify email before accessing</p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={e => onChange('requireEmailVerification', e.target.checked)}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Session & Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Session Timeout (minutes)</label>
            <input type="number" min="5" max="480" value={settings.sessionTimeout} onChange={e => onChange('sessionTimeout', parseInt(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">Max Login Attempts</label>
            <input type="number" min="3" max="20" value={settings.maxLoginAttempts} onChange={e => onChange('maxLoginAttempts', parseInt(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">Minimum Password Length</label>
            <input type="number" min="6" max="32" value={settings.passwordMinLength} onChange={e => onChange('passwordMinLength', parseInt(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">API Rate Limit (req/min)</label>
            <input type="number" min="100" max="10000" value={settings.apiRateLimit} onChange={e => onChange('apiRateLimit', parseInt(e.target.value))} className="input" />
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Admin Password</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" placeholder="••••••••" className="input" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="input" />
          </div>
          <button className="btn-secondary">Update Password</button>
        </div>
      </div>
    </div>
  )
}

function IntegrationSettings({ settings, onChange }) {
  const integrations = [
    { key: 'googleAnalytics', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX', description: 'Google Analytics 4 measurement ID' },
    { key: 'googleTagManager', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX', description: 'GTM container ID' },
    { key: 'facebookPixel', label: 'Facebook Pixel ID', placeholder: '1234567890', description: 'Meta Pixel ID for tracking' },
    { key: 'hotjar', label: 'Hotjar Site ID', placeholder: '1234567', description: 'Hotjar tracking ID' },
    { key: 'sentry', label: 'Sentry DSN', placeholder: 'https://xxx@sentry.io/123', description: 'Error tracking DSN' },
    { key: 'stripe', label: 'Stripe Publishable Key', placeholder: 'pk_live_...', description: 'Stripe public key for payments' },
    { key: 'paypal', label: 'PayPal Client ID', placeholder: 'AbCdEfGhIjKlMnOp', description: 'PayPal REST API client ID' },
  ]
  
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Third-Party Integrations</h3>
        <div className="space-y-4">
          {integrations.map(item => (
            <div key={item.key} className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50">
              <label className="label mb-2">{item.label}</label>
              <input
                type="text"
                value={settings[item.key]}
                onChange={e => onChange(item.key, e.target.value)}
                className="input font-mono text-sm"
                placeholder={item.placeholder}
              />
              <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdvancedSettings({ settings, onChange }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">API & Webhooks</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Enable Public API</p>
              <p className="text-sm text-dark-500 dark:text-dark-500">Allow external access to API endpoints</p>
            </div>
            <input
              type="checkbox"
              checked={settings.apiEnabled}
              onChange={e => onChange('apiEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 cursor-pointer hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">Enable Webhooks</p>
              <p className="text-sm text-dark-500 dark:text-dark-500">Send webhook events for order updates</p>
            </div>
            <input
              type="checkbox"
              checked={settings.webhooksEnabled}
              onChange={e => onChange('webhooksEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">CORS & Headers</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Allowed CORS Origins</label>
            <textarea
              rows={3}
              value={settings.corsOrigins}
              onChange={e => onChange('corsOrigins', e.target.value)}
              className="input resize-none font-mono text-sm"
              placeholder="https://example.com, https://app.example.com"
            />
            <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">Comma-separated list of allowed origins</p>
          </div>
          <div>
            <label className="label">Custom HTTP Headers</label>
            <textarea
              rows={4}
              value={settings.customHeaders}
              onChange={e => onChange('customHeaders', e.target.value)}
              className="input resize-none font-mono text-sm"
              placeholder="X-Custom-Header: value&#10;X-Another-Header: value"
            />
            <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">One header per line in format: Header-Name: value</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Backup & Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Backup Frequency</label>
            <select value={settings.backupFrequency} onChange={e => onChange('backupFrequency', e.target.value)} className="input">
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="label">Log Retention (days)</label>
            <input type="number" min="7" max="365" value={settings.logRetention} onChange={e => onChange('logRetention', parseInt(e.target.value))} className="input" />
          </div>
        </div>
      </div>
    </div>
  )
}