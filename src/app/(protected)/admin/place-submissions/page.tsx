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
  ClipboardList,
  Mail,
  User,
  Camera,
  FileText,
  Shield,
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 shadow-btn-primary ring-1 ring-white/25">
              <ClipboardList className="h-5 w-5 text-white drop-shadow-sm" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Place Submissions</h1>
              <p className="text-sm text-slate-500">Review and manage place submissions from the community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {actionError && <Alert variant="error" className="mb-4">{actionError}</Alert>}
        {actionSuccess && <Alert variant="success" className="mb-4">{actionSuccess}</Alert>}

        {/* Status tabs */}
        <div className="mb-6 rounded-xl panel-surface p-1.5 shadow-card inline-flex flex-wrap gap-1">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                activeTab === status
                  ? 'bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-btn-primary ring-1 ring-white/15'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {SUBMISSION_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl panel-surface p-12 text-center shadow-card">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <p className="mt-3 text-sm text-slate-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-2xl panel-surface p-12 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-7 w-7 text-slate-400" aria-hidden="true" />
            </div>
            <p className="text-lg font-semibold text-slate-700">No submissions</p>
            <p className="mt-1 text-sm text-slate-500">
              No submissions with status &quot;{SUBMISSION_STATUS_LABELS[activeTab]}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </p>
            {submissions.map((sub) => {
              const expanded = expandedId === sub._id;
              const icon = CATEGORY_ICONS[sub.placeData.category] || '📍';
              const catLabel = PLACE_CATEGORIES[sub.placeData.category] || sub.placeData.category;

              return (
                <div key={sub._id} className="rounded-2xl panel-surface overflow-hidden shadow-card transition-shadow duration-200 hover:shadow-lg">
                  {/* Summary row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : sub._id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-slate-50/80"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xl" aria-hidden="true">{icon}</span>
                        <span className="text-base font-bold text-slate-900">{sub.placeData.name}</span>
                        <Badge variant="info" className="text-xs">{catLabel}</Badge>
                        <Badge variant={STATUS_BADGE_MAP[sub.status]} className="text-xs">
                          {SUBMISSION_STATUS_LABELS[sub.status]}
                        </Badge>
                        {sub.submittedBy.isOwnerOrManager && (
                          <Badge variant="warning" className="text-xs">
                            <Shield className="mr-0.5 h-3 w-3 inline-block" aria-hidden="true" />
                            Owner/Manager
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {sub.placeData.address}, {sub.placeData.city}, {sub.placeData.province}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Submitted by <span className="font-medium text-slate-500">{sub.submittedBy.name}</span> ({sub.submittedBy.role}) on{' '}
                        {new Date(sub.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${expanded ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                      <div className="p-5 sm:p-6 space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                          {/* Place Details */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                              Place Details
                            </h4>
                            <dl className="space-y-2 text-sm">
                              {sub.placeData.description && (
                                <dd className="text-slate-600 leading-relaxed">{sub.placeData.description}</dd>
                              )}
                              {sub.placeData.website && (
                                <dd className="flex items-center gap-1.5 text-slate-600">
                                  <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                                  <a href={sub.placeData.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline hover:text-primary-700 truncate">
                                    {sub.placeData.website}
                                  </a>
                                </dd>
                              )}
                              {sub.placeData.phone && (
                                <dd className="flex items-center gap-1.5 text-slate-600">
                                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                                  {sub.placeData.phone}
                                </dd>
                              )}
                              {sub.placeData.email && (
                                <dd className="flex items-center gap-1.5 text-slate-600">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                                  {sub.placeData.email}
                                </dd>
                              )}
                              {sub.latitude && sub.longitude && (
                                <dd className="text-xs text-slate-400">
                                  Coordinates: {sub.latitude.toFixed(4)}, {sub.longitude.toFixed(4)}
                                  {sub.entrancePinned && ' (entrance)'}
                                </dd>
                              )}
                            </dl>
                          </div>

                          {/* Submitter Info */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" aria-hidden="true" />
                              Submitter Info
                            </h4>
                            <dl className="space-y-2 text-sm">
                              <dd className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <User className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                                {sub.submittedBy.name}
                              </dd>
                              <dd className="flex items-center gap-1.5 text-slate-600">
                                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                                {sub.submittedBy.email}
                              </dd>
                              <dd className="text-slate-600">
                                Role: <span className="font-medium">{sub.submittedBy.role}</span>
                              </dd>
                              <dd>
                                {sub.submittedBy.isOwnerOrManager ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                                    <Shield className="h-3 w-3" aria-hidden="true" />
                                    Claims to be owner/manager
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                    Community submission
                                  </span>
                                )}
                              </dd>
                            </dl>
                          </div>
                        </div>

                        {/* Accessibility */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Accessibility Info
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(sub.accessibilityData.checklist).map(([key, val]) => (
                              <span
                                key={key}
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                  val
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                }`}
                              >
                                {val ? '✓' : '✗'} {key}
                              </span>
                            ))}
                            {Object.keys(sub.accessibilityData.checklist).length === 0 && (
                              <span className="text-sm text-slate-400 italic">None provided</span>
                            )}
                          </div>
                          {sub.accessibilityData.generalNotes && (
                            <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <span className="font-medium text-slate-700">Notes:</span> {sub.accessibilityData.generalNotes}
                            </p>
                          )}
                        </div>

                        {/* Photos */}
                        {sub.photoUrls.length > 0 && (
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                              Photos ({sub.photoUrls.length})
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {sub.photoUrls.map((url, i) => (
                                <img key={i} src={url} alt={`Photo ${i + 1}`} className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-sm" />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin actions */}
                        {(sub.status === 'submitted' || sub.status === 'under_review' || sub.status === 'needs_more_info') && (
                          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-5">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Admin Actions</h4>
                            <div className="mb-4">
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
                                className="bg-gradient-to-b from-green-500 to-green-600 shadow-sm ring-1 ring-green-400/30 hover:from-green-500 hover:to-green-550"
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
                                className="shadow-btn-outline"
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
                                className="shadow-btn-outline"
                              >
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                Duplicate
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
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
