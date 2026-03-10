import { ObjectId } from 'mongodb';

export type ReportType =
  | 'broken_elevator'
  | 'blocked_ramp'
  | 'construction_barrier'
  | 'missing_curb_cut'
  | 'inaccessible_washroom'
  | 'broken_door'
  | 'uneven_surface'
  | 'other';

export const REPORT_TYPES: Record<ReportType, string> = {
  broken_elevator: 'Broken Elevator',
  blocked_ramp: 'Blocked Ramp',
  construction_barrier: 'Construction Barrier',
  missing_curb_cut: 'Missing Curb Cut',
  inaccessible_washroom: 'Inaccessible Washroom',
  broken_door: 'Broken Automatic Door',
  uneven_surface: 'Uneven / Damaged Surface',
  other: 'Other Issue',
};

export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

export interface Report {
  _id: ObjectId;
  placeId: ObjectId;
  userId: ObjectId;
  type: ReportType;
  description: string;
  photoUrls?: string[];
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
