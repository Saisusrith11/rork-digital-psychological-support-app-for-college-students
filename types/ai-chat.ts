export type ChatCondition = 'stress' | 'anxiety' | 'depression' | 'sleep' | 'emergency';

export type ChatStep = 
  | 'welcome'
  | 'initial-assessment'
  | 'emergency-response'
  | 'first-activity'
  | 'first-check'
  | 'advanced-activity'
  | 'second-check'
  | 'success'
  | 'professional-help';

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: string[];
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  condition?: ChatCondition;
  currentStep: ChatStep;
  messages: ChatMessage[];
  activityCompleted: boolean;
  advancedActivityCompleted: boolean;
  startedAt: Date;
  endedAt?: Date;
}