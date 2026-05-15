'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';

export default function StudentVisitLogPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500">Loading…</p>}>
      <VisitLogForm />
    </Suspense>
  );
}

function VisitLogForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetPlaceId = searchParams.get('placeId') ?? '';

  const [placeId, setPlaceId] = useState(presetPlaceId);
  const [visitType, setVisitType] = useState('first_visit');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 16));
  const [outcome, setOutcome] = useState('left_materials');
  const [contactName, setContactName] = useState('');
  const [interestLevel, setInterestLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeId.trim()) {
      setError('Place ID is required — open a business from the list first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/student/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: placeId.trim(),
          visitType,
          visitDate: new Date(visitDate).toISOString(),
          outcome,
          contactName: contactName || undefined,
          interestLevel: interestLevel || undefined,
          notes: notes || undefined,
          nextFollowUpDate: nextFollowUpDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save visit');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/student'), 1500);
    } catch {
      setError('Failed to save visit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/student"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to businesses
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Log outreach visit</h1>

      {done ? (
        <Alert variant="success" className="mt-6">
          Visit saved. Returning to your list…
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div>
            <Label htmlFor="placeId">Business ID</Label>
            <Input id="placeId" value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="mt-1" />
            <p className="mt-1 text-xs text-slate-500">Pre-filled when opened from a business card.</p>
          </div>
          <div>
            <Label htmlFor="visitType">Visit type</Label>
            <Select id="visitType" value={visitType} onChange={(e) => setVisitType(e.target.value)} className="mt-1">
              <option value="first_visit">First visit</option>
              <option value="follow_up">Follow-up</option>
              <option value="verification">Verification</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="visitDate">Visit date & time</Label>
            <Input
              id="visitDate"
              type="datetime-local"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Select id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} className="mt-1">
              <option value="left_materials">Left materials</option>
              <option value="spoke_to_manager">Spoke to manager</option>
              <option value="needs_follow_up">Needs follow-up</option>
              <option value="not_interested">Not interested</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="contactName">Contact name (optional)</Label>
            <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="interest">Interest level</Label>
            <Select id="interest" value={interestLevel} onChange={(e) => setInterestLevel(e.target.value)} className="mt-1">
              <option value="">—</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="followUp">Next follow-up date</Label>
            <Input
              id="followUp"
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Save visit
          </Button>
        </form>
      )}
    </div>
  );
}

