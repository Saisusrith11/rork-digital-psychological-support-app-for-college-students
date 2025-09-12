import { AssessmentQuestion } from '@/types/assessment';

// Updated scoring system based on clinical assessment criteria
// Regular questions: 0-3 points each
// Hopelessness question: Weighted scoring (0, 5, 10, 15 points)

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'interest_pleasure',
    question: 'In the past two weeks, how often have you felt little interest or pleasure in doing things?',
    options: [
      { value: 'never', label: 'Never', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'anxiety_nervousness',
    question: 'How frequently have you felt nervous, anxious, or on edge recently?',
    options: [
      { value: 'never', label: 'Never', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'sleep_troubles',
    question: 'Have you had trouble falling asleep, staying asleep, or sleeping too much?',
    options: [
      { value: 'not_at_all', label: 'Not at all', score: 0 },
      { value: 'several_days', label: 'Several days', score: 1 },
      { value: 'more_than_half', label: 'More than half the days', score: 2 },
      { value: 'nearly_every_day', label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 'overwhelmed',
    question: 'How often have you felt overwhelmed by academic or personal responsibilities?',
    options: [
      { value: 'never', label: 'Never', score: 0 },
      { value: 'sometimes', label: 'Sometimes', score: 1 },
      { value: 'often', label: 'Often', score: 2 },
      { value: 'almost_always', label: 'Almost always', score: 3 },
    ],
  },
  {
    id: 'concentration',
    question: 'In the last month, how would you rate your ability to concentrate on your studies or tasks?',
    options: [
      { value: 'very_good', label: 'Very good', score: 0 },
      { value: 'good', label: 'Good', score: 1 },
      { value: 'fair', label: 'Fair', score: 2 },
      { value: 'poor', label: 'Poor', score: 3 },
    ],
  },
  {
    id: 'hopelessness',
    question: 'Have you experienced feelings of hopelessness or thoughts that life is not worth living?',
    options: [
      { value: 'never', label: 'Never', score: 0 },
      { value: 'rarely', label: 'Rarely', score: 1 },
      { value: 'sometimes', label: 'Sometimes', score: 2 },
      { value: 'often', label: 'Often', score: 3 },
    ],
  },
  {
    id: 'social_connection',
    question: 'How connected do you feel to your friends, family, or peers?',
    options: [
      { value: 'very_connected', label: 'Very connected', score: 0 },
      { value: 'somewhat_connected', label: 'Somewhat connected', score: 1 },
      { value: 'slightly_connected', label: 'Slightly connected', score: 2 },
      { value: 'not_connected', label: 'Not connected at all', score: 3 },
    ],
  },
  {
    id: 'relaxation_activities',
    question: 'How frequently do you engage in activities that help you relax or feel calm?',
    options: [
      { value: 'daily', label: 'Daily', score: 0 },
      { value: 'several_times_week', label: 'Several times a week', score: 1 },
      { value: 'occasionally', label: 'Occasionally', score: 2 },
      { value: 'rarely_never', label: 'Rarely or never', score: 3 },
    ],
  },
  {
    id: 'appetite_weight',
    question: 'Have you noticed any changes in your appetite or weight recently without trying?',
    options: [
      { value: 'no_changes', label: 'No changes', score: 0 },
      { value: 'mild_changes', label: 'Mild changes', score: 1 },
      { value: 'moderate_changes', label: 'Moderate changes', score: 2 },
      { value: 'significant_changes', label: 'Significant changes', score: 3 },
    ],
  },
  {
    id: 'help_seeking',
    question: 'How confident are you in your ability to seek help or support when you need it?',
    options: [
      { value: 'very_confident', label: 'Very confident', score: 0 },
      { value: 'somewhat_confident', label: 'Somewhat confident', score: 1 },
      { value: 'not_very_confident', label: 'Not very confident', score: 2 },
      { value: 'not_confident', label: 'Not confident at all', score: 3 },
    ],
  },
];

export const getAssessmentResult = (totalScore: number, responses: any[]) => {
  // Apply the new scoring system based on user requirements
  // Regular questions: 0-3 points ("Not at all": 0, "A few days": 1, "More than half the days": 2, "Nearly every day": 3)
  // Hopelessness question (Question 6): Weighted scoring ("Not at all": 0, "Rarely": 5, "Sometimes": 10, "Often": 15)
  
  const hopelessnessResponse = responses.find(r => r.questionId === 'hopelessness');
  let adjustedScore = totalScore;
  
  if (hopelessnessResponse) {
    // Apply weighted scoring for hopelessness question
    const hopelessnessValue = hopelessnessResponse.selectedValue;
    let hopelessnessWeight = 0;
    
    switch (hopelessnessValue) {
      case 'never': hopelessnessWeight = 0; break;
      case 'rarely': hopelessnessWeight = 5; break;
      case 'sometimes': hopelessnessWeight = 10; break;
      case 'often': hopelessnessWeight = 15; break;
      default: hopelessnessWeight = 0;
    }
    
    // Replace the original hopelessness score with weighted score
    adjustedScore = totalScore - hopelessnessResponse.score + hopelessnessWeight;
  }

  // Score 0-5 (Minimal Concern)
  if (adjustedScore <= 5) {
    return {
      category: 'minimal' as const,
      recommendations: [
        'Based on your responses, your mental well-being seems to be in a good place. It\'s great to see you\'re managing well. Keep up with your self-care practices!',
        'Continue exploring our resource library for proactive wellness content',
        'Consider mindfulness exercises and journaling prompts to maintain your well-being',
        'Keep tracking your mood to maintain awareness of your mental health',
      ],
    };
  }
  // Score 6-10 (Mild Concern)
  else if (adjustedScore <= 10) {
    return {
      category: 'mild' as const,
      recommendations: [
        'It seems like you\'ve been facing some challenges recently. You might be experiencing a mild degree of stress or anxiety. Remember that it\'s okay to feel this way. Exploring our resources or talking to a trained peer could be helpful.',
        'Access our relaxation audio and stress management tips',
        'Consider connecting with a peer support volunteer for guidance',
        'Try incorporating regular self-care activities and coping strategies',
        'Monitor your mood regularly and track your progress',
      ],
    };
  }
  // Score 11-15 (Moderate Concern)
  else if (adjustedScore <= 15) {
    return {
      category: 'moderate' as const,
      recommendations: [
        'Your responses indicate you may be dealing with moderate mental health challenges. This is a significant concern, but please know you are not alone. It\'s highly recommended that you speak with a professional. We can help you book a confidential appointment with a college counsellor.',
        'Use our confidential booking system to schedule a professional counseling session',
        'Access our mental health helpline for immediate support',
        'Engage with our AI chat for coping strategies and guidance',
        'Stay connected with supportive friends, family, and peer volunteers',
        'Utilize our comprehensive resource library for additional support',
      ],
    };
  }
  // Score 16+ (Significant Concern)
  else {
    return {
      category: 'severe' as const,
      recommendations: [
        'Your well-being is our top priority. The pattern in your responses suggests a high level of distress. It is essential that you seek immediate professional help. We have a confidential booking system and a helpline available 24/7. Please, reach out to them now. You don\'t have to face this alone.',
        'URGENT: Contact our 24/7 mental health helpline immediately',
        'Book an emergency counseling session through our confidential system',
        'Reach out to trusted friends, family, or emergency services if needed',
        'Use our crisis support resources and AI chat for immediate coping strategies',
        'Consider contacting campus security or emergency services if you feel unsafe',
      ],
    };
  }
};