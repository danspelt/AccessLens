'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { PLACE_CATEGORIES, CATEGORY_ICONS, type PlaceCategory } from '@/models/Place';
import { SUBMISSION_STATUS_LABELS, type PlaceSubmissionStatus } from '@/models/PlaceSubmission';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  MapPin,
  Globe,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Submission {
  _id: string;
  placeData: {
    name: string;
    category: PlaceCategory;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    phone?: string;
    website?: string;
    email?: string;
    description?: string;
  };
  latitude?: number;
  longitude?: number;
  entrancePinned?: boolean;
  accessibilityData: {
    checklist: Record<string, boolean>;
    generalNotes?: string;
  };
  photoUrls: string[];
  submittedBy: {
    userId: string;
    name: string;
    email: string;
    role: string;
    isOwnerOrManager: boolean;
  };
  status: PlaceSubmissionStatus;
  createdAt: string;
}

const STATUS_TABS: PlaceSubmissionStatus[] = ['submitted', 'under_review', 'approved', 'rejected', 'duplicate', 'needs_more_info'];

const STATUS_BADGE_MAP: Record<PlaceSubmissionStatus, 'info' | 'success' | 'error' | 'warning' | 'default'> = {
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  rejected: 'error',
  duplicate: 'default',
  needs_more_info: 'warning',
};

export default function AdminPlaceSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlaceSubmissionStatus>('submitted');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async (status: PlaceSubmissionStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/place-submissions?status=${status}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab, fetchSubmissions]);

  async function handleAction(submissionId: string, action: string) {
    setActionLoading(submissionId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/place-submissions/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: adminNotes[submissionId] || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Action failed');
        return;
      }
      setActionSuccess(data.message || 'Action completed');
      fetchSubmissions(activeTab);
    } catch {
      setActionError('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">Place Submissions</h1>
          <p className="text-sm text-slate-500">Review and manage place submissions from the community</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {actionError && <Alert variant="error" className="mb-4">{actionError}</Alert>}
        {actionSuccess && <Alert variant="success" className="mb-4">{actionSuccess}</Alert>}

        {/* Status tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {SUBMISSION_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl panel-surface p-8 text-center">
            <p className="text-slate-500">No submissions with status &quot;{SUBMISSION_STATUS_LABELS[activeTab]}&quot;</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const expanded = expandedId === sub._id;
              const icon = CATEGORY_ICONS[sub.placeData.category] || '📍';
              const catLabel = PLACE_CATEGORIES[sub.placeData.category] || sub.placeData.category;

              return (
                <div key={sub._id} className="rounded-xl panel-surface overflow-hidden">
                  {/* Summary row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : sub._id)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg" aria-hidden="true">{icon}</span>
                        <span className="font-semibold text-slate-900">{sub.placeData.name}</span>
                        <Badge variant="info" className="text-xs">{catLabel}</Badge>
                        <Badge variant={STATUS_BADGE_MAP[sub.status]} className="text-xs">
                          {SUBMISSION_STATUS_LABELS[sub.status]}
                        </Badge>
                        {sub.submittedBy.isOwnerOrManager && (
                          <Badge variant="warning" className="text-xs">Owner/Manager</Badge>
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {sub.placeData.address}, {sub.placeData.city}, {sub.placeData.province}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Submitted by {sub.submittedBy.name} ({sub.submittedBy.role}) on{' '}
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {expanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-slate-100 p-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase">Place Details</h4>
                          <dl className="mt-2 space-y-1 text-sm">
                            {sub.placeData.description && (
                              <dd className="text-slate-600">{sub.placeData.description}</dd>
                            )}
                            {sub.placeData.website && (
                              <dd className="flex items-center gap-1 text-slate-600">
                                <Globe className="h-3 w-3" aria-hidden="true" />
                                <a href={sub.placeData.website} target="_blank" rel="noopener noreferrer" className="underline">
                                  {sub.placeData.website}
                                </a>
                              </dd>
                            )}
                            {sub.placeData.phone && (
                              <dd className="flex items-center gap-1 text-slate-600">
                                <Phone className="h-3 w-3" aria-hidden="true" />
                                {sub.placeData.phone}
                              </dd>
                            )}
                            {sub.placeData.email && (
                              <dd className="text-slate-600">Email: {sub.placeData.email}</dd>
                            )}
                          </dl>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase">Submitter Info</h4>
                          <dl className="mt-2 space-y-1 text-sm">
                            <dd className="text-slate-600">{sub.submittedBy.name}</dd>
                            <dd className="text-slate-600">{sub.submittedBy.email}</dd>
                            <dd className="text-slate-600">Role: {sub.submittedBy.role}</dd>
                            <dd className="text-slate-600">
                              {sub.submittedBy.isOwnerOrManager ? 'Claims to be owner/manager' : 'Community submission'}
                            </dd>
                          </dl>
                        </div>
                      </div>

                      {/* Accessibility */}
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Accessibility Info</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(sub.accessibilityData.checklist).map(([key, val]) => (
                            <span
                              key={key}
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {val ? '✓' : '✗'} {key}
                            </span>
                          ))}
                          {Object.keys(sub.accessibilityData.checklist).length === 0 && (
                            <span className="text-xs text-slate-400">None provided</span>
                          )}
                        </div>
                        {sub.accessibilityData.generalNotes && (
                          <p className="mt-2 text-xs text-slate-600">Notes: {sub.accessibilityData.generalNotes}</p>
                        )}
                      </div>

                      {/* Photos */}
                      {sub.photoUrls.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Photos</h4>
                          <div className="flex gap-2 overflow-x-auto">
                            {sub.photoUrls.map((url, i) => (
                              <img key={i} src={url} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin actions (only for actionable statuses) */}
                      {(sub.status === 'submitted' || sub.status === 'under_review' || sub.status === 'needs_more_info') && (
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Admin Actions</h4>
                          <div className="mb-3">
                            <Textarea
                              value={adminNotes[sub._id] || ''}
                              onChange={(e) => setAdminNotes((prev) => ({ ...prev, [sub._id]: e.target.value }))}
                              placeholder="Admin notes (optional)..."
                              rows={2}
                              maxLength={500}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAction(sub._id, 'approve')}
                              loading={actionLoading === sub._id}
                              disabled={!!actionLoading}
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleAction(sub._id, 'reject')}
                              loading={actionLoading === sub._id}
                              disabled={!!actionLoading}
                            >
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(sub._id, 'needs_more_info')}
                              loading={actionLoading === sub._id}
                              disabled={!!actionLoading}
                            >
                              <HelpCircle className="h-4 w-4" aria-hidden="true" />
                              Needs More Info
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(sub._id, 'duplicate')}
                              loading={actionLoading === sub._id}
                              disabled={!!actionLoading}
                            >
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              Duplicate
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
