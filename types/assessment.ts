export interface AssessmentQuestion {
  id: string;
  question: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  value: string;
  label: string;
  score: number;
}

export interface AssessmentResponse {
  questionId: string;
  selectedValue: string;
  score: number;
}

export interface AssessmentResult {
  totalScore: number;
  category: 'minimal' | 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  completedAt: Date;
}

export interface Assessment {
  id: string;
  responses: AssessmentResponse[];
  result: AssessmentResult;
  completedAt: Date;
  consentStatus?: 'pending' | 'granted' | 'denied';
  consentTimestamp?: Date;
  studentId?: string;
  anonymousCode?: string;
}

export interface ConsentRequest {
  assessmentId: string;
  consentGranted: boolean;
  timestamp: Date;
}

export interface CounselorAssessmentView {
  id: string;
  anonymousCode: string;
  totalScore: number;
  category: 'minimal' | 'mild' | 'moderate' | 'severe';
  completedAt: Date;
  consentGranted: boolean;
  studentId?: string;
}