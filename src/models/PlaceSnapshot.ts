import { ObjectId } from 'mongodb';
import type { AccessibilityAnswer } from '@/models/Review';

export type SnapshotFieldName =
  | 'stepFreeEntrance'
  | 'ramp'
  | 'accessibleWashroom'
  | 'elevator'
  | 'accessibleParking';

export type SnapshotFieldValue = AccessibilityAnswer | undefined;

export interface PlaceSnapshotFields {
  stepFreeEntrance?: SnapshotFieldValue;
  ramp?: SnapshotFieldValue;
  accessibleWashroom?: SnapshotFieldValue;
  elevator?: SnapshotFieldValue;
  accessibleParking?: SnapshotFieldValue;
}

export interface PlaceSnapshotConflicts {
  stepFreeEntrance?: boolean;
  ramp?: boolean;
  accessibleWashroom?: boolean;
  elevator?: boolean;
  accessibleParking?: boolean;
}

export interface PlaceSnapshotSignals {
  reportCount: number;
  photoCount: number;
  confidenceScore: number;
}

export interface PlaceSnapshot {
  _id: ObjectId;
  placeId: ObjectId;
  fields: PlaceSnapshotFields;
  conflicts: PlaceSnapshotConflicts;
  lastComputedAt: Date;
  signals: PlaceSnapshotSignals;
}
