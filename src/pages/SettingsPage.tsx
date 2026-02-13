import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/storage';
import { AppSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const update = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await saveSettings(settings);
      toast.success('Settings saved!');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Error saving settings');
    }
  };

  if (loading || !settings) return <div className="pb-20 px-4 pt-4 text-center py-10">Loading settings...</div>;

  return (
    <div className="pb-20 px-4 pt-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-y-4">
        <div className="border-2 border-border bg-card p-4 shadow-2xs space-y-3">
          <h2 className="font-bold text-sm uppercase text-muted-foreground">Company</h2>
          <div>
            <Label className="text-xs font-bold uppercase">Company Name</Label>
            <Input value={settings.companyName} onChange={e => update({ companyName: e.target.value })} className="border-2" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase">Address</Label>
            <Input value={settings.companyAddress} onChange={e => update({ companyAddress: e.target.value })} className="border-2" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase">Phone</Label>
            <Input value={settings.companyPhone} onChange={e => update({ companyPhone: e.target.value })} className="border-2" />
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4 shadow-2xs space-y-3">
          <h2 className="font-bold text-sm uppercase text-muted-foreground">Invoice</h2>
          <div>
            <Label className="text-xs font-bold uppercase">Currency Symbol</Label>
            <Input value={settings.currency} onChange={e => update({ currency: e.target.value })} className="border-2 w-20" />
          </div>
          <div>
            <Label className="text-xs font-bold uppercase">Tax Rate (%)</Label>
            <Input type="number" min="0" max="100" value={settings.taxRate} onChange={e => update({ taxRate: parseFloat(e.target.value) || 0 })} className="border-2 w-24" />
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4 shadow-2xs space-y-3">
          <h2 className="font-bold text-sm uppercase text-muted-foreground">Security</h2>
          <div>
            <Label className="text-xs font-bold uppercase">PIN Code (leave empty to disable)</Label>
            <Input type="password" inputMode="numeric" maxLength={6} value={settings.pinCode} onChange={e => update({ pinCode: e.target.value.replace(/\D/g, '') })} className="border-2 w-32" placeholder="••••" />
          </div>
        </div>

        <div className="border-2 border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm uppercase text-muted-foreground">Appearance</h2>
              <p className="text-sm">Dark Mode</p>
            </div>
            <Switch checked={settings.darkMode} onCheckedChange={v => update({ darkMode: v })} />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full border-2 font-bold">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
