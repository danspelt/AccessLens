'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

type ThemeMode = 'system' | 'light' | 'dark';
type FontScale = 'sm' | 'md' | 'lg';

export type SettingsPrefs = {
  theme: ThemeMode;
  accentColor: string;
  fontScale: FontScale;
};

function applyToDom(prefs: SettingsPrefs) {
  const root = document.documentElement;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const effectiveTheme = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme;
  root.dataset.theme = effectiveTheme;
  root.style.setProperty('--accent', prefs.accentColor);

  const fontSize = prefs.fontScale === 'sm' ? '14px' : prefs.fontScale === 'lg' ? '18px' : '16px';
  root.style.setProperty('--base-font-size', fontSize);
}

export default function SettingsClient({ initial }: { initial: SettingsPrefs }) {
  const [prefs, setPrefs] = useState<SettingsPrefs>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(
    () =>
      prefs.theme !== initial.theme ||
      prefs.accentColor !== initial.accentColor ||
      prefs.fontScale !== initial.fontScale,
    [prefs, initial]
  );

  useEffect(() => {
    // local fallback first
    try {
      const raw = localStorage.getItem('accesslens:prefs');
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsPrefs;
        setPrefs((p) => ({ ...p, ...parsed }));
        applyToDom({ ...initial, ...parsed });
        return;
      }
    } catch {
      // ignore
    }
    applyToDom(initial);
  }, [initial]);

  useEffect(() => {
    applyToDom(prefs);
    try {
      localStorage.setItem('accesslens:prefs', JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setSaved(false);
  }, [prefs]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to save settings');
        return;
      }
      setSaved(true);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Personalize your dashboard experience.</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {saved && <Alert variant="success">Saved.</Alert>}

      <Card padding="md">
        <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              className="mt-1.5"
              value={prefs.theme}
              onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value as SettingsPrefs['theme'] }))}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="accent">Accent color</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <Input
                id="accent"
                type="color"
                value={prefs.accentColor}
                onChange={(e) => setPrefs((p) => ({ ...p, accentColor: e.target.value }))}
                className="h-10 w-16 p-1"
                aria-label="Accent color"
              />
              <Input
                type="text"
                value={prefs.accentColor}
                onChange={(e) => setPrefs((p) => ({ ...p, accentColor: e.target.value }))}
                className="flex-1"
                aria-label="Accent color hex"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fontScale">Font size</Label>
            <Select
              id="fontScale"
              className="mt-1.5"
              value={prefs.fontScale}
              onChange={(e) => setPrefs((p) => ({ ...p, fontScale: e.target.value as SettingsPrefs['fontScale'] }))}
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setPrefs(initial)}
            disabled={!dirty || saving}
          >
            Reset
          </Button>
          <Button type="button" onClick={handleSave} loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

