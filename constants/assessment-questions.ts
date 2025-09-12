import { AssessmentQuestion } from '@/types/assessment';

// Standardized Mental Health Assessment Questions
// Based on PHQ-9, GAD-7, and GHQ-12 clinical screening tools
// Introduction: "The following questions ask about how often you have been bothered by any of the following problems over the last two weeks."
// All questions use consistent 0-3 scoring system

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // PHQ-9 Questions (Depression Screening)
  {
    id: 'interest_pleasure',
    question: 'Little interest or pleasure in doing things.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'feeling_depressed',
    question: 'Feeling down, depressed, or hopeless.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'sleep_troubles',
    question: 'Trouble falling or staying asleep, or sleeping too much.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'tired_energy',
    question: 'Feeling tired or having little energy.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'appetite',
    question: 'Poor appetite or overeating.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'feeling_bad',
    question: 'Feeling bad about yourself—or that you are a failure or have let yourself or your family down.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'concentration',
    question: 'Trouble concentrating on things, such as reading or watching television.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'suicidal_thoughts',
    question: 'Thoughts that you would be better off dead or of hurting yourself in some way.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  // GAD-7 Questions (Anxiety Screening)
  {
    id: 'feeling_nervous',
    question: 'Feeling nervous, anxious, or on edge.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'control_worrying',
    question: 'Not being able to stop or control worrying.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'worrying_too_much',
    question: 'Worrying too much about different things.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'trouble_relaxing',
    question: 'Trouble relaxing.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  // GHQ-12 Questions (General Mental Health Screening)
  {
    id: 'under_strain',
    question: 'Feeling constantly under strain.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'enjoy_activities',
    question: 'Able to enjoy your day-to-day activities.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 3 },
      { value: 'several_days', label: 'Several days', score: 2 },
      { value: 'more_than_half', label: 'More than half the days', score: 1 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 0 },
    ],
  },
  {
    id: 'unhappy_depressed',
    question: 'Feeling unhappy and depressed.',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
];

export const getAssessmentResult = (totalScore: number, responses: any[]) => {
  // Check for suicidal ideation (Question #8) - immediate urgent referral
  const suicidalResponse = responses.find(r => r.questionId === 'suicidal_thoughts');
  const hasSuicidalThoughts = suicidalResponse && suicidalResponse.score > 0;
  
  // If any suicidal thoughts detected OR score is 26+, trigger urgent referral
  if (hasSuicidalThoughts || totalScore >= 26) {
    return {
      category: 'severe' as const,
      recommendations: [
        'The app must not attempt to treat the issue. Instead, it must trigger an Urgent Referral Alert.',
        'URGENT: Contact our 24/7 mental health helpline immediately',
        'Book an emergency counseling session through our confidential system',
        'Reach out to trusted friends, family, or emergency services if needed',
        'Consider contacting campus security or emergency services if you feel unsafe',
      ],
    };
  }

  // Score 0-10 (Minimal to Mild Stress/Anxiety)
  if (totalScore <= 10) {
    return {
      category: 'minimal' as const,
      recommendations: [
        'Your mental health appears stable. Keep up the good work! We recommend you explore our Psychoeducational Resource Hub for tips on maintaining wellness.',
        'Continue exploring our resource library for proactive wellness content',
        'Consider mindfulness exercises and journaling prompts to maintain your well-being',
        'Keep tracking your mood to maintain awareness of your mental health',
      ],
    };
  }
  // Score 11-25 (Moderate Stress/Anxiety)
  else if (totalScore <= 25) {
    return {
      category: 'moderate' as const,
      recommendations: [
        'You appear to be experiencing some moderate distress. We recommend engaging with our AI-Guided First-Aid Support for coping strategies and exploring the Peer Support Forum for shared experiences. You should also consider booking a confidential appointment with a professional.',
        'Use our confidential booking system to schedule a professional counseling session',
        'Access our AI chatbot for specific coping techniques and stress management strategies',
        'Engage with our Peer Support Forum for shared experiences and guidance',
        'Explore our comprehensive resource library for additional support',
        'Consider grounding techniques and academic stress management strategies',
      ],
    };
  }
  // Score 26+ (Severe Stress/Anxiety) - This case is already handled above
  else {
    return {
      category: 'severe' as const,
      recommendations: [
        'The app must not attempt to treat the issue. Instead, it must trigger an Urgent Referral Alert.',
        'URGENT: Contact our 24/7 mental health helpline immediately',
        'Book an emergency counseling session through our confidential system',
        'Reach out to trusted friends, family, or emergency services if needed',
        'Consider contacting campus security or emergency services if you feel unsafe',
      ],
    };
  }
};