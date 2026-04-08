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
type ContentDensity = 'comfortable' | 'compact';
type LineHeight = 'compact' | 'normal' | 'comfortable';
type Units = 'metric' | 'imperial';
type ProfileVisibility = 'public' | 'private';

export type SettingsPrefs = {
  theme: ThemeMode;
  accentColor: string;
  fontScale: FontScale;
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  contentDensity: ContentDensity;
  lineHeight: LineHeight;
  units: Units;
  mapAutoLoad: boolean;
  profileVisibility: ProfileVisibility;
  emailNotifications: boolean;
};

const DEFAULT_PREFS: SettingsPrefs = {
  theme: 'system',
  accentColor: '#0284c7',
  fontScale: 'md',
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  contentDensity: 'comfortable',
  lineHeight: 'normal',
  units: 'metric',
  mapAutoLoad: true,
  profileVisibility: 'public',
  emailNotifications: false,
};

function normalizeAccent(raw: string): string {
  const v = (raw || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return DEFAULT_PREFS.accentColor;
}

function applyToDom(prefs: SettingsPrefs) {
  const root = document.documentElement;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const effectiveTheme = prefs.theme === 'system' ? (systemDark ? 'dark' : 'light') : prefs.theme;
  root.dataset.theme = effectiveTheme;
  root.style.setProperty('--accent', normalizeAccent(prefs.accentColor));

  const fontSize = prefs.fontScale === 'sm' ? '14px' : prefs.fontScale === 'lg' ? '18px' : '16px';
  root.style.setProperty('--base-font-size', fontSize);

  const lineHeight =
    prefs.lineHeight === 'compact' ? '1.35' : prefs.lineHeight === 'comfortable' ? '1.7' : '1.5';
  root.style.setProperty('--line-height', lineHeight);

  root.dataset.highContrast = prefs.highContrast ? 'true' : 'false';
  root.dataset.reduceMotion = prefs.reduceMotion ? 'true' : 'false';
  root.dataset.dyslexiaFont = prefs.dyslexiaFont ? 'true' : 'false';
  root.dataset.density = prefs.contentDensity;
}

export default function SettingsClient({ initial }: { initial: SettingsPrefs }) {
  const [baseline, setBaseline] = useState<SettingsPrefs>({
    ...DEFAULT_PREFS,
    ...initial,
    accentColor: normalizeAccent(initial.accentColor),
  });
  const [prefs, setPrefs] = useState<SettingsPrefs>(baseline);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(
    () =>
      prefs.theme !== baseline.theme ||
      normalizeAccent(prefs.accentColor) !== baseline.accentColor ||
      prefs.fontScale !== baseline.fontScale ||
      prefs.highContrast !== baseline.highContrast ||
      prefs.reduceMotion !== baseline.reduceMotion ||
      prefs.dyslexiaFont !== baseline.dyslexiaFont ||
      prefs.contentDensity !== baseline.contentDensity ||
      prefs.lineHeight !== baseline.lineHeight ||
      prefs.units !== baseline.units ||
      prefs.mapAutoLoad !== baseline.mapAutoLoad ||
      prefs.profileVisibility !== baseline.profileVisibility ||
      prefs.emailNotifications !== baseline.emailNotifications,
    [prefs, baseline]
  );

  useEffect(() => {
    let cancelled = false;

    // local fallback first (fast paint), then hydrate from server
    try {
      const raw = localStorage.getItem('accesslens:prefs');
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsPrefs;
        const merged: SettingsPrefs = {
          ...DEFAULT_PREFS,
          ...initial,
          ...parsed,
          accentColor: normalizeAccent(parsed.accentColor ?? initial.accentColor),
        };
        setBaseline(merged);
        setPrefs(merged);
        applyToDom(merged);
      }
    } catch {
      // ignore
    }
    if (!localStorage.getItem('accesslens:prefs')) {
      const merged: SettingsPrefs = {
        ...DEFAULT_PREFS,
        ...initial,
        accentColor: normalizeAccent(initial.accentColor),
      };
      setBaseline(merged);
      setPrefs(merged);
      applyToDom(merged);
    }

    (async () => {
      try {
        const res = await fetch('/api/settings', { method: 'GET' });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const serverPrefs: SettingsPrefs = {
          theme: data.theme ?? DEFAULT_PREFS.theme,
          accentColor: normalizeAccent(data.accentColor ?? DEFAULT_PREFS.accentColor),
          fontScale: data.fontScale ?? DEFAULT_PREFS.fontScale,
          highContrast: data.highContrast ?? DEFAULT_PREFS.highContrast,
          reduceMotion: data.reduceMotion ?? DEFAULT_PREFS.reduceMotion,
          dyslexiaFont: data.dyslexiaFont ?? DEFAULT_PREFS.dyslexiaFont,
          contentDensity: data.contentDensity ?? DEFAULT_PREFS.contentDensity,
          lineHeight: data.lineHeight ?? DEFAULT_PREFS.lineHeight,
          units: data.units ?? DEFAULT_PREFS.units,
          mapAutoLoad: data.mapAutoLoad ?? DEFAULT_PREFS.mapAutoLoad,
          profileVisibility: data.profileVisibility ?? DEFAULT_PREFS.profileVisibility,
          emailNotifications: data.emailNotifications ?? DEFAULT_PREFS.emailNotifications,
        };

        if (cancelled) return;
        setBaseline(serverPrefs);
        setPrefs(serverPrefs);
        applyToDom(serverPrefs);
        try {
          localStorage.setItem('accesslens:prefs', JSON.stringify(serverPrefs));
        } catch {
          // ignore
        }
      } catch {
        // ignore (offline, etc.)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initial]);

  useEffect(() => {
    applyToDom(prefs);
    try {
      localStorage.setItem(
        'accesslens:prefs',
        JSON.stringify({ ...prefs, accentColor: normalizeAccent(prefs.accentColor) })
      );
    } catch {
      // ignore
    }
    setSaved(false);
  }, [prefs]);

  useEffect(() => {
    if (prefs.theme !== 'system') return;
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql?.addEventListener) return;
    const handler = () => applyToDom(prefs);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [prefs]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const normalized: SettingsPrefs = {
        ...prefs,
        accentColor: normalizeAccent(prefs.accentColor),
      };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to save settings');
        return;
      }
      setBaseline(normalized);
      setPrefs(normalized);
      try {
        localStorage.setItem('accesslens:prefs', JSON.stringify(normalized));
      } catch {
        // ignore
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
                value={normalizeAccent(prefs.accentColor)}
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
            <p className="mt-1 text-xs text-slate-500">Use a hex value like #0284c7.</p>
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

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <Label htmlFor="contentDensity">Content density</Label>
            <Select
              id="contentDensity"
              className="mt-1.5"
              value={prefs.contentDensity}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, contentDensity: e.target.value as SettingsPrefs['contentDensity'] }))
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="lineHeight">Line height</Label>
            <Select
              id="lineHeight"
              className="mt-1.5"
              value={prefs.lineHeight}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, lineHeight: e.target.value as SettingsPrefs['lineHeight'] }))
              }
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="comfortable">Comfortable</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="units">Units</Label>
            <Select
              id="units"
              className="mt-1.5"
              value={prefs.units}
              onChange={(e) => setPrefs((p) => ({ ...p, units: e.target.value as SettingsPrefs['units'] }))}
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Accessibility</h3>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {[
              {
                id: 'highContrast',
                label: 'High contrast',
                description: 'Increase contrast for text, borders, and focus.',
                value: prefs.highContrast,
                onChange: (v: boolean) => setPrefs((p) => ({ ...p, highContrast: v })),
              },
              {
                id: 'reduceMotion',
                label: 'Reduce motion',
                description: 'Minimize animations and transitions.',
                value: prefs.reduceMotion,
                onChange: (v: boolean) => setPrefs((p) => ({ ...p, reduceMotion: v })),
              },
              {
                id: 'dyslexiaFont',
                label: 'Dyslexia-friendly font',
                description: 'Use a more readable font stack.',
                value: prefs.dyslexiaFont,
                onChange: (v: boolean) => setPrefs((p) => ({ ...p, dyslexiaFont: v })),
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
              >
                <input
                  id={item.id}
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-800">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Preferences</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                id="mapAutoLoad"
                type="checkbox"
                checked={prefs.mapAutoLoad}
                onChange={(e) => setPrefs((p) => ({ ...p, mapAutoLoad: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">Map auto-load</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  If off, maps won’t load until you click “Load map”.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                id="emailNotifications"
                type="checkbox"
                checked={prefs.emailNotifications}
                onChange={(e) => setPrefs((p) => ({ ...p, emailNotifications: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">Email notifications</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Saved now; we’ll use this as we add notification emails.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Privacy</h3>
          <div className="mt-3 max-w-sm">
            <Label htmlFor="profileVisibility">Profile visibility</Label>
            <Select
              id="profileVisibility"
              className="mt-1.5"
              value={prefs.profileVisibility}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, profileVisibility: e.target.value as SettingsPrefs['profileVisibility'] }))
              }
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Select>
            <p className="mt-1 text-xs text-slate-500">Saved now; used when we add public profiles.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => setPrefs(baseline)}
            disabled={!dirty || saving}
          >
            Reset
          </Button>
          <Button type="button" onClick={handleSave} loading={saving || loading} disabled={!dirty || loading}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

