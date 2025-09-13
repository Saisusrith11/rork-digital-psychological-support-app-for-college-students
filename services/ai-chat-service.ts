import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'normal' | 'urgent' | 'coping' | 'assessment' | 'resource';
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  resources?: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'grounding' | 'sleep' | 'academic' | 'social';
  steps: string[];
  duration?: string;
  effectiveness?: string;
}

interface ContentPart {
  type: 'text';
  text: string;
}

interface CoreMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export class AIChatService {
  private static instance: AIChatService;
  private conversationHistory: CoreMessage[] = [];
  private readonly maxHistoryLength = 20;
  private readonly apiUrl = 'https://toolkit.rork.com/text/llm/';

  private constructor() {
    this.initializeHistory();
  }

  static getInstance(): AIChatService {
    if (!AIChatService.instance) {
      AIChatService.instance = new AIChatService();
    }
    return AIChatService.instance;
  }

  private async initializeHistory() {
    try {
      const stored = await AsyncStorage.getItem('ai_conversation_history');
      if (stored) {
        this.conversationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  private async saveHistory() {
    try {
      // Keep only recent messages to avoid storage issues
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-this.maxHistoryLength + 1)
        ];
      }
      await AsyncStorage.setItem('ai_conversation_history', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem('ai_conversation_history');
  }

  private getSystemPrompt(): string {
    return `You are a compassionate, professional mental health support AI assistant for college students. Your role is to:

1. Provide empathetic, non-judgmental support
2. Offer evidence-based coping strategies and resources
3. Recognize crisis situations and provide appropriate emergency resources
4. Help students understand their emotions and develop healthy coping mechanisms
5. Encourage professional help when appropriate

IMPORTANT GUIDELINES:
- Always prioritize student safety
- Be warm, understanding, and supportive
- Use simple, clear language
- Validate feelings without minimizing them
- Suggest practical, actionable coping strategies
- Recognize cultural sensitivity and diversity
- Never provide medical diagnoses or replace professional therapy
- If someone expresses suicidal thoughts or self-harm, immediately provide crisis resources

RESPONSE STRUCTURE:
1. Acknowledge and validate their feelings
2. Show empathy and understanding
3. Offer relevant coping strategies or resources
4. Encourage self-care and professional support when needed
5. End with a supportive, hopeful message

For crisis situations, immediately provide:
- Emergency hotline numbers
- Campus counseling resources
- Clear steps to get immediate help

Remember: You're a supportive first line of help, not a replacement for professional mental health care.`;
  }

  private analyzeUrgency(text: string): 'urgent' | 'high' | 'moderate' | 'low' {
    const lowerText = text.toLowerCase();
    
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living', 
      'hurt myself', 'self harm', 'die', 'hopeless', 'no point',
      'better off dead', 'ending everything', 'can\'t go on'
    ];
    
    const highPriorityKeywords = [
      'panic attack', 'can\'t breathe', 'emergency', 'crisis',
      'breakdown', 'can\'t cope', 'losing control', 'scared'
    ];
    
    const moderateKeywords = [
      'depressed', 'anxious', 'stressed', 'overwhelmed',
      'lonely', 'isolated', 'worried', 'nervous'
    ];

    if (crisisKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'urgent';
    }
    if (highPriorityKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    }
    if (moderateKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'moderate';
    }
    return 'low';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords = {
      academic: ['exam', 'study', 'assignment', 'grades', 'deadline', 'project', 'test', 'homework'],
      sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'rest', 'nightmare'],
      social: ['lonely', 'friends', 'relationship', 'isolated', 'social', 'people'],
      anxiety: ['anxious', 'worry', 'nervous', 'panic', 'fear', 'scared'],
      depression: ['sad', 'depressed', 'hopeless', 'empty', 'numb', 'worthless'],
      stress: ['stress', 'pressure', 'overwhelmed', 'burden', 'too much']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  async processMessage(userInput: string): Promise<{
    response: string;
    type: 'normal' | 'urgent' | 'coping' | 'assessment' | 'resource';
    urgency: 'urgent' | 'high' | 'moderate' | 'low';
    topics: string[];
    suggestedActions?: Array<{ label: string; action: string }>;
    resources?: Array<{ title: string; description: string; link?: string }>;
  }> {
    const urgency = this.analyzeUrgency(userInput);
    const topics = this.extractTopics(userInput);

    // For urgent cases, provide immediate crisis response
    if (urgency === 'urgent') {
      return {
        response: `I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out for immediate help:

🆘 **Emergency Resources:**
• National Suicide Prevention Lifeline: 988 (24/7)
• Crisis Text Line: Text HOME to 741741
• Emergency Services: 911

You don't have to go through this alone. There are people who want to help and support you. Would you like me to help you connect with a counselor right now?`,
        type: 'urgent',
        urgency: 'urgent',
        topics,
        suggestedActions: [
          { label: 'Call Crisis Hotline', action: 'call:988' },
          { label: 'Book Emergency Session', action: 'booking:emergency' },
          { label: 'Contact Campus Counseling', action: 'contact:counseling' }
        ],
        resources: [
          {
            title: 'Crisis Support',
            description: '24/7 immediate help available',
            link: 'tel:988'
          }
        ]
      };
    }

    try {
      // Prepare conversation context
      if (this.conversationHistory.length === 0) {
        this.conversationHistory.push({
          role: 'system',
          content: this.getSystemPrompt()
        });
      }

      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      // Create enhanced prompt with context
      const enhancedMessages: CoreMessage[] = [
        ...this.conversationHistory,
        {
          role: 'system',
          content: `Based on the conversation, the urgency level is: ${urgency}. 
Topics identified: ${topics.join(', ') || 'general support'}.
Please provide a supportive, empathetic response with practical coping strategies if appropriate.
Keep the response concise but helpful (2-3 paragraphs max).`
        }
      ];

      // Call LLM API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: enhancedMessages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.completion;

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Save conversation history
      await this.saveHistory();

      // Determine response type based on content and urgency
      let responseType: 'normal' | 'urgent' | 'coping' | 'assessment' | 'resource' = 'normal';
      if (urgency === 'high' || topics.includes('anxiety') || topics.includes('stress')) {
        responseType = 'coping';
      }

      // Generate suggested actions based on topics
      const suggestedActions = this.generateSuggestedActions(topics, urgency);
      const resources = this.generateResources(topics);

      return {
        response: aiResponse,
        type: responseType,
        urgency,
        topics,
        suggestedActions,
        resources
      };
    } catch (error) {
      console.error('Error processing message with AI:', error);
      
      // Fallback to enhanced rule-based response
      return this.getFallbackResponse(userInput, urgency, topics);
    }
  }

  private generateSuggestedActions(topics: string[], urgency: string): Array<{ label: string; action: string }> {
    const actions: Array<{ label: string; action: string }> = [];

    if (urgency === 'high') {
      actions.push({ label: 'Book Counseling Session', action: 'booking' });
      actions.push({ label: 'Try Breathing Exercise', action: 'coping:breathing' });
    }

    if (topics.includes('academic')) {
      actions.push({ label: 'Academic Support Resources', action: 'resources:academic' });
      actions.push({ label: 'Study Tips & Techniques', action: 'resources:study' });
    }

    if (topics.includes('sleep')) {
      actions.push({ label: 'Sleep Hygiene Guide', action: 'resources:sleep' });
      actions.push({ label: 'Relaxation Exercises', action: 'coping:relaxation' });
    }

    if (topics.includes('anxiety')) {
      actions.push({ label: 'Anxiety Management Tools', action: 'resources:anxiety' });
      actions.push({ label: 'Grounding Techniques', action: 'coping:grounding' });
    }

    if (topics.includes('social')) {
      actions.push({ label: 'Join Peer Support Forum', action: 'community' });
      actions.push({ label: 'Campus Social Groups', action: 'resources:social' });
    }

    return actions.slice(0, 3); // Limit to 3 actions
  }

  private generateResources(topics: string[]): Array<{ title: string; description: string; link?: string }> {
    const resources: Array<{ title: string; description: string; link?: string }> = [];

    const resourceMap: Record<string, Array<{ title: string; description: string; link?: string }>> = {
      academic: [
        {
          title: 'Time Management Strategies',
          description: 'Learn effective techniques to manage your study time and reduce academic stress'
        },
        {
          title: 'Study Skills Workshop',
          description: 'Interactive guide to improve your learning and retention'
        }
      ],
      sleep: [
        {
          title: 'Sleep Hygiene Checklist',
          description: 'Evidence-based tips for better sleep quality'
        },
        {
          title: 'Bedtime Meditation',
          description: 'Guided relaxation to help you fall asleep'
        }
      ],
      anxiety: [
        {
          title: 'Anxiety Toolkit',
          description: 'Comprehensive guide to understanding and managing anxiety'
        },
        {
          title: 'Quick Calm Techniques',
          description: '5-minute exercises to reduce anxiety immediately'
        }
      ],
      depression: [
        {
          title: 'Mood Tracking Journal',
          description: 'Track your emotions and identify patterns'
        },
        {
          title: 'Self-Care Activities',
          description: 'Simple activities to boost your mood'
        }
      ],
      social: [
        {
          title: 'Building Connections',
          description: 'Guide to making friends and building relationships in college'
        },
        {
          title: 'Communication Skills',
          description: 'Improve your social interactions and confidence'
        }
      ],
      stress: [
        {
          title: 'Stress Management Plan',
          description: 'Create your personalized stress reduction strategy'
        },
        {
          title: 'Mindfulness Exercises',
          description: 'Simple practices to stay present and calm'
        }
      ]
    };

    topics.forEach(topic => {
      if (resourceMap[topic]) {
        resources.push(...resourceMap[topic]);
      }
    });

    return resources.slice(0, 3); // Limit to 3 resources
  }

  private getFallbackResponse(userInput: string, urgency: string, topics: string[]): any {
    const responses: Record<string, string> = {
      academic: `I understand that academic pressure can be really overwhelming. It's completely normal to feel stressed about exams and assignments. 

Here are some strategies that many students find helpful:
• Break large tasks into smaller, manageable steps
• Use the Pomodoro technique (25 minutes work, 5 minutes break)
• Create a study schedule that includes regular breaks
• Don't hesitate to ask professors or TAs for help

Remember, your worth isn't defined by your grades. Taking care of your mental health will actually help your academic performance.`,

      sleep: `Sleep difficulties can really impact how you feel during the day. Let's work on improving your sleep quality together.

Some evidence-based tips that can help:
• Try to go to bed and wake up at the same time every day
• Create a relaxing bedtime routine (reading, gentle stretching)
• Avoid screens for at least 30 minutes before bed
• Keep your room cool, dark, and quiet

If sleep problems persist for more than 2 weeks, consider talking to a counselor or health professional.`,

      anxiety: `I hear that you're feeling anxious, and I want you to know that's a very common experience, especially for students. Your feelings are valid.

Let's try some techniques that can help calm your anxiety:
• Deep breathing: Inhale for 4, hold for 4, exhale for 6
• 5-4-3-2-1 grounding: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
• Progressive muscle relaxation: Tense and release each muscle group

Would you like me to guide you through one of these exercises?`,

      social: `Feeling lonely or isolated can be really tough, especially in a college environment. You're not alone in feeling this way.

Building connections takes time, but here are some steps you can take:
• Join a club or group related to your interests
• Attend campus events, even if you go alone at first
• Start small - even a smile or "hello" to classmates counts
• Consider joining online communities for your hobbies

Remember, quality matters more than quantity when it comes to friendships.`,

      default: `Thank you for sharing what you're going through. I can sense this is important to you, and I'm here to support you.

It takes courage to reach out and talk about your feelings. Whatever you're experiencing, your emotions are valid and it's okay to feel this way.

Would you like to tell me more about what's been on your mind? Sometimes just talking through our thoughts can help us gain clarity and feel less alone.`
    };

    // Select appropriate response based on topics
    let response = responses.default;
    if (topics.length > 0 && responses[topics[0]]) {
      response = responses[topics[0]];
    }

    return {
      response,
      type: urgency === 'high' ? 'coping' : 'normal',
      urgency,
      topics,
      suggestedActions: this.generateSuggestedActions(topics, urgency),
      resources: this.generateResources(topics)
    };
  }

  getCopingStrategies(category?: string): CopingStrategy[] {
    const allStrategies: CopingStrategy[] = [
      {
        id: '1',
        title: 'Box Breathing Technique',
        description: 'A powerful stress-relief technique used by Navy SEALs',
        category: 'breathing',
        steps: [
          'Sit comfortably with your back straight',
          'Exhale completely through your mouth',
          'Inhale through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale through your mouth for 4 counts',
          'Hold empty for 4 counts',
          'Repeat 4-6 times'
        ],
        duration: '5 minutes',
        effectiveness: 'Immediate anxiety relief'
      },
      {
        id: '2',
        title: 'Progressive Muscle Relaxation',
        description: 'Release physical tension to calm your mind',
        category: 'mindfulness',
        steps: [
          'Find a quiet, comfortable place to sit or lie down',
          'Start with your toes - tense them for 5 seconds',
          'Release and notice the feeling of relaxation',
          'Move up to calves, thighs, abdomen, arms, shoulders, face',
          'Tense each muscle group for 5 seconds then release',
          'Focus on the contrast between tension and relaxation',
          'End with deep breathing'
        ],
        duration: '10-15 minutes',
        effectiveness: 'Reduces physical symptoms of stress'
      },
      {
        id: '3',
        title: 'STOP Technique',
        description: 'Quick mindfulness check-in for overwhelming moments',
        category: 'grounding',
        steps: [
          'S - Stop what you\'re doing',
          'T - Take a breath (or several deep breaths)',
          'O - Observe your thoughts, feelings, and sensations',
          'P - Proceed with intention and awareness'
        ],
        duration: '1-2 minutes',
        effectiveness: 'Interrupts anxiety spirals'
      },
      {
        id: '4',
        title: 'Study Sprint Method',
        description: 'Manage academic stress with structured study sessions',
        category: 'academic',
        steps: [
          'Choose one specific task to focus on',
          'Set a timer for 25 minutes',
          'Work with full concentration - no distractions',
          'When timer rings, take a 5-minute break',
          'After 4 sprints, take a longer 15-30 minute break',
          'Track completed sprints for motivation'
        ],
        duration: '25-minute cycles',
        effectiveness: 'Improves focus and reduces procrastination'
      },
      {
        id: '5',
        title: '4-7-8 Sleep Breathing',
        description: 'Natural tranquilizer for the nervous system',
        category: 'sleep',
        steps: [
          'Lie down comfortably in bed',
          'Exhale completely through your mouth',
          'Close your mouth, inhale through nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through mouth for 8 counts',
          'Repeat 3-4 times',
          'Let your breathing return to normal and drift off'
        ],
        duration: '3-5 minutes',
        effectiveness: 'Helps fall asleep faster'
      },
      {
        id: '6',
        title: 'Social Anxiety Reset',
        description: 'Prepare for and manage social situations',
        category: 'social',
        steps: [
          'Before social situation: Set one small, achievable goal',
          'Use positive self-talk: "I can handle this"',
          'Focus on others rather than yourself',
          'Ask open-ended questions to shift attention',
          'Take bathroom breaks if you need to reset',
          'Celebrate small wins afterward'
        ],
        duration: 'As needed',
        effectiveness: 'Builds social confidence gradually'
      }
    ];

    if (category) {
      return allStrategies.filter(s => s.category === category);
    }
    return allStrategies;
  }
}