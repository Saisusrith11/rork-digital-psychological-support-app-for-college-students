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
}