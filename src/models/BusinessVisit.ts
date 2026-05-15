import { ObjectId } from 'mongodb';

export type VisitType = 'first_visit' | 'follow_up' | 'verification';

export type VisitOutcome =
  | 'left_materials'
  | 'spoke_to_manager'
  | 'not_interested'
  | 'closed'
  | 'needs_follow_up';

export interface BusinessVisit {
  _id: ObjectId;
  placeId: ObjectId;
  studentUserId: ObjectId;
  visitType: VisitType;
  visitDate: Date;
  outcome: VisitOutcome;
  contactName?: string;
  interestLevel?: 'high' | 'medium' | 'low' | 'none';
  notes?: string;
  nextFollowUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
