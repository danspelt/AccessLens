'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Item = { id: string; title: string; message: string; href: string; read: boolean; createdAt: string };

export function NotificationsClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  async function load() {
    const response = await fetch('/api/notifications');
    if (response.ok) { const data = await response.json(); setItems(data.notifications); setUnread(data.unreadCount); }
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    void fetch('/api/notifications').then(async (response) => {
      if (!active) return;
      if (response.ok) {
        const data = await response.json();
        if (active) { setItems(data.notifications); setUnread(data.unreadCount); }
      }
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);
  async function markRead(id?: string) {
    const response = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(id ? { id } : { all: true }) });
    if (response.ok) await load();
  }
  if (loading) return <p role="status" className="text-slate-600">Loading notifications…</p>;
  return <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-bold text-slate-900">Notifications</h1><p aria-live="polite" className="mt-1 text-slate-600">{unread} unread {unread === 1 ? 'update' : 'updates'}</p></div>
      {unread > 0 && <button type="button" onClick={() => void markRead()} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">Mark all as read</button>}
    </div>
    {items.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No updates yet. Follow a place to hear when its public accessibility information changes.</p> :
      <ul className="space-y-3">{items.map((item) => <li key={item.id} className={`rounded-xl border p-5 ${item.read ? 'border-slate-200 bg-white' : 'border-primary-200 bg-primary-50'}`}>
        <Link href={item.href} onClick={() => !item.read && void markRead(item.id)} className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          <div className="flex items-start justify-between gap-4"><h2 className="font-semibold text-slate-900">{item.title}</h2>{!item.read && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">Unread</span>}</div>
          <p className="mt-1 text-sm text-slate-700">{item.message}</p><time className="mt-2 block text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
        </Link>
      </li>)}</ul>}
  </div>;
}
