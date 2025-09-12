export interface ResourceContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'exercise';
  category: string;
  duration?: string;
  content: string;
  techniques?: string[];
  tips?: string[];
  language: string;
  tags: string[];
  icon: string;
}

export const resourcesData: ResourceContent[] = [
  {
    id: '1',
    title: 'Stress Management Techniques',
    description: 'Learn practical ways to manage academic and personal stress',
    type: 'article',
    category: 'Stress & Anxiety',
    duration: '5 min read',
    icon: 'target',
    language: 'English',
    tags: ['stress', 'management', 'academic'],
    content: `Understanding Stress

Stress is your body's natural response to challenges and demands. While some stress can be motivating, chronic stress can impact your physical and mental health. Learning to manage stress effectively is crucial for college success and overall wellbeing.

Quick Stress Relief Techniques

When you're feeling overwhelmed, these techniques can provide immediate relief:

• Take 5 deep breaths, inhaling for 4 counts and exhaling for 6
• Practice the 5-4-3-2-1 grounding technique
• Do a quick body scan and release tension
• Step outside for fresh air and sunlight
• Listen to calming music for 5 minutes
• Do gentle stretches or yoga poses

Long-term Stress Management

Building resilience against stress requires consistent practice:

• Establish a regular sleep schedule
• Exercise regularly, even if just 15 minutes daily
• Practice mindfulness or meditation
• Maintain social connections
• Set realistic goals and expectations
• Learn to say no to excessive commitments
• Seek support when needed`,
    techniques: [
      'Deep breathing exercises',
      '5-4-3-2-1 grounding technique',
      'Progressive muscle relaxation',
      'Mindfulness meditation',
      'Time management strategies'
    ]
  },
  {
    id: '2',
    title: 'Better Sleep for Students',
    description: 'Improve your sleep quality with these evidence-based tips',
    type: 'article',
    category: 'Sleep & Wellness',
    duration: '7 min read',
    icon: 'moon',
    language: 'English',
    tags: ['sleep', 'wellness', 'health'],
    content: `Why Sleep Matters for Students

Quality sleep is essential for memory consolidation, cognitive function, and emotional regulation. Poor sleep can significantly impact academic performance, mood, and overall health.

Sleep Hygiene Basics

Create an environment and routine that promotes good sleep:

• Keep your bedroom cool, dark, and quiet
• Use your bed only for sleep and rest
• Establish a consistent sleep schedule
• Avoid screens 1 hour before bedtime
• Create a relaxing bedtime routine
• Limit caffeine after 2 PM
• Avoid large meals close to bedtime

Dealing with Sleep Problems

If you're having trouble sleeping:

• Try the 4-7-8 breathing technique
• Practice progressive muscle relaxation
• Use guided sleep meditations
• Keep a sleep diary to identify patterns
• Consider speaking with a healthcare provider if problems persist

Power Napping Guidelines

If you need to nap:
• Keep naps to 20-30 minutes
• Nap before 3 PM
• Find a quiet, comfortable space
• Set an alarm to avoid oversleeping`,
    techniques: [
      '4-7-8 breathing technique',
      'Progressive muscle relaxation',
      'Sleep hygiene practices',
      'Bedtime routine establishment'
    ]
  },
  {
    id: '3',
    title: 'Deep Breathing Exercises',
    description: 'Simple breathing techniques to calm your mind and reduce anxiety',
    type: 'exercise',
    category: 'Coping Skills',
    duration: '10 min',
    icon: 'wind',
    language: 'English',
    tags: ['breathing', 'anxiety', 'relaxation'],
    content: `The Power of Breath

Breathing exercises are one of the most effective ways to activate your body's relaxation response. They can be done anywhere, anytime, and provide immediate relief from stress and anxiety.

4-7-8 Breathing Technique

1. Exhale completely through your mouth
2. Close your mouth and inhale through your nose for 4 counts
3. Hold your breath for 7 counts
4. Exhale through your mouth for 8 counts
5. Repeat 3-4 times

Box Breathing (4-4-4-4)

1. Inhale for 4 counts
2. Hold for 4 counts
3. Exhale for 4 counts
4. Hold empty for 4 counts
5. Repeat for 5-10 cycles

Belly Breathing

1. Place one hand on your chest, one on your belly
2. Breathe slowly through your nose
3. Feel your belly rise while your chest stays still
4. Exhale slowly through pursed lips
5. Continue for 5-10 minutes

When to Use These Techniques

• Before exams or presentations
• When feeling anxious or overwhelmed
• Before sleep to promote relaxation
• During study breaks
• Anytime you need to center yourself`,
    techniques: [
      '4-7-8 breathing',
      'Box breathing',
      'Belly breathing',
      'Coherent breathing'
    ]
  },
  {
    id: '4',
    title: 'Mindfulness for Students',
    description: 'Learn mindfulness practices to improve focus and reduce stress',
    type: 'article',
    category: 'Mindfulness',
    duration: '8 min read',
    icon: 'brain',
    language: 'English',
    tags: ['mindfulness', 'meditation', 'focus'],
    content: `What is Mindfulness?

Mindfulness is the practice of paying attention to the present moment without judgment. It can help improve focus, reduce stress, and enhance emotional regulation.

Simple Mindfulness Exercises

5-Minute Mindful Breathing
1. Sit comfortably with eyes closed or softly focused
2. Focus on your natural breath
3. When your mind wanders, gently return to your breath
4. Notice the sensation of breathing without trying to change it

Body Scan Meditation
1. Lie down or sit comfortably
2. Start at the top of your head
3. Slowly move attention through each part of your body
4. Notice sensations without trying to change them
5. Take 10-15 minutes for a full body scan

Mindful Walking
1. Walk slowly and deliberately
2. Focus on the sensation of your feet touching the ground
3. Notice your surroundings without judgment
4. When your mind wanders, return to the physical sensations of walking

Mindfulness in Daily Life

• Eat meals without distractions
• Practice mindful listening in conversations
• Take mindful breaks between study sessions
• Notice your thoughts and emotions without judgment
• Use transition moments (walking to class) for brief mindfulness`,
    techniques: [
      'Mindful breathing',
      'Body scan meditation',
      'Mindful walking',
      'Present moment awareness'
    ]
  },
  {
    id: '5',
    title: 'Academic Stress Management',
    description: 'Strategies to handle academic pressure and maintain balance',
    type: 'article',
    category: 'Academic Support',
    duration: '6 min read',
    icon: 'book-open',
    language: 'English',
    tags: ['academic', 'stress', 'study', 'time-management'],
    content: `Understanding Academic Stress

Academic stress is common among college students and can stem from various sources: heavy workloads, deadlines, exams, competition, and future uncertainties.

Time Management Strategies

• Use a planner or digital calendar
• Break large tasks into smaller, manageable steps
• Prioritize tasks using the Eisenhower Matrix
• Set realistic daily and weekly goals
• Build in buffer time for unexpected delays
• Schedule regular breaks and self-care

Study Techniques for Stress Reduction

Pomodoro Technique
1. Study for 25 minutes
2. Take a 5-minute break
3. Repeat 3-4 times
4. Take a longer 15-30 minute break

Active Recall
• Test yourself regularly
• Explain concepts out loud
• Create mind maps and summaries
• Use flashcards for key information

Dealing with Exam Anxiety

Before the Exam:
• Review material regularly, don't cram
• Get adequate sleep the night before
• Eat a healthy breakfast
• Arrive early to settle in
• Practice relaxation techniques

During the Exam:
• Read instructions carefully
• Start with easier questions
• Use deep breathing if you feel anxious
• Manage your time effectively

Seeking Support

• Form study groups with classmates
• Visit professors during office hours
• Use campus tutoring services
• Connect with academic advisors
• Consider counseling services if stress becomes overwhelming`,
    techniques: [
      'Pomodoro Technique',
      'Active recall methods',
      'Time blocking',
      'Stress inoculation training'
    ]
  },
  {
    id: '6',
    title: 'Progressive Muscle Relaxation',
    description: 'Release physical tension and promote deep relaxation',
    type: 'exercise',
    category: 'Relaxation',
    duration: '15 min',
    icon: 'zap',
    language: 'English',
    tags: ['relaxation', 'tension', 'muscle', 'stress-relief'],
    content: `What is Progressive Muscle Relaxation?

Progressive Muscle Relaxation (PMR) is a technique that involves tensing and then relaxing different muscle groups in your body. It helps you become aware of physical tension and learn to release it.

Benefits of PMR

• Reduces physical tension and stress
• Improves sleep quality
• Decreases anxiety and worry
• Enhances body awareness
• Can be done anywhere

Basic PMR Technique

1. Find a quiet, comfortable place to sit or lie down
2. Close your eyes and take a few deep breaths
3. Start with your toes and work your way up
4. Tense each muscle group for 5-7 seconds
5. Release the tension and relax for 10-15 seconds
6. Notice the difference between tension and relaxation

Muscle Group Sequence

1. Toes and feet
2. Calves and shins
3. Thighs and glutes
4. Abdomen
5. Hands and forearms
6. Upper arms and shoulders
7. Neck and throat
8. Face and scalp

Quick PMR for Busy Students

When you have limited time:
• Focus on areas where you hold the most tension
• Do a 5-minute version targeting shoulders, neck, and face
• Practice mini-sessions between classes
• Use PMR before sleep for better rest

Tips for Success

• Practice regularly for best results
• Don't tense muscles too hard
• Focus on the contrast between tension and relaxation
• If you have injuries, skip those muscle groups
• Combine with deep breathing for enhanced effects`,
    techniques: [
      'Full body PMR',
      'Quick tension release',
      'Targeted muscle relaxation',
      'Breath-assisted PMR'
    ]
  },
  {
    id: '7',
    title: 'Anxiety Coping Strategies',
    description: 'Practical tools to manage anxiety and panic symptoms',
    type: 'article',
    category: 'Anxiety Management',
    duration: '9 min read',
    icon: 'shield',
    language: 'English',
    tags: ['anxiety', 'panic', 'coping', 'mental-health'],
    content: `Understanding Anxiety

Anxiety is a normal response to stress, but when it becomes overwhelming or persistent, it can interfere with daily life. Learning effective coping strategies can help you manage anxiety symptoms.

Immediate Anxiety Relief Techniques

5-4-3-2-1 Grounding Technique
• 5 things you can see
• 4 things you can touch
• 3 things you can hear
• 2 things you can smell
• 1 thing you can taste

Box Breathing
• Inhale for 4 counts
• Hold for 4 counts
• Exhale for 4 counts
• Hold for 4 counts
• Repeat 5-10 times

Cognitive Strategies

Challenge Anxious Thoughts
• Is this thought realistic?
• What evidence supports or contradicts it?
• What would I tell a friend in this situation?
• What's the worst that could realistically happen?
• How likely is that outcome?

Thought Stopping
• Notice when anxious thoughts begin
• Say "STOP" mentally or out loud
• Redirect attention to something else
• Use a physical cue like snapping a rubber band

Lifestyle Strategies

• Limit caffeine and alcohol
• Exercise regularly
• Maintain a consistent sleep schedule
• Practice relaxation techniques daily
• Stay connected with supportive people
• Limit news and social media if they increase anxiety

When to Seek Help

Consider professional support if:
• Anxiety interferes with daily activities
• You avoid situations due to anxiety
• Physical symptoms are severe or persistent
• You have thoughts of self-harm
• Coping strategies aren't providing relief`,
    techniques: [
      '5-4-3-2-1 grounding',
      'Cognitive restructuring',
      'Thought stopping',
      'Exposure therapy basics'
    ]
  },
  {
    id: '8',
    title: 'Building Resilience',
    description: 'Develop mental strength and bounce back from challenges',
    type: 'article',
    category: 'Personal Growth',
    duration: '10 min read',
    icon: 'trending-up',
    language: 'English',
    tags: ['resilience', 'growth', 'strength', 'recovery'],
    content: `What is Resilience?

Resilience is the ability to adapt and bounce back from adversity, trauma, tragedy, or significant stress. It's not about avoiding difficulties, but learning to navigate through them effectively.

Key Components of Resilience

Emotional Regulation
• Recognize and name your emotions
• Practice self-compassion
• Use healthy coping strategies
• Seek support when needed

Cognitive Flexibility
• Challenge negative thought patterns
• Look for multiple perspectives
• Focus on what you can control
• Practice problem-solving skills

Social Connection
• Maintain relationships with family and friends
• Build a support network
• Participate in community activities
• Help others when possible

Building Resilience Skills

Develop a Growth Mindset
• View challenges as opportunities to learn
• Embrace effort as a path to mastery
• Learn from criticism and setbacks
• Find inspiration in others' success

Practice Self-Care
• Prioritize physical health
• Engage in activities you enjoy
• Set boundaries
• Practice mindfulness and relaxation

Set Realistic Goals
• Break large goals into smaller steps
• Celebrate small victories
• Adjust goals as needed
• Focus on progress, not perfection

Resilience in Academic Settings

• View failures as learning opportunities
• Develop effective study strategies
• Build relationships with professors and peers
• Use campus resources and support services
• Maintain perspective on temporary setbacks

Daily Resilience Practices

• Keep a gratitude journal
• Practice mindfulness meditation
• Exercise regularly
• Connect with others
• Engage in meaningful activities
• Reflect on past successes and strengths`,
    techniques: [
      'Cognitive reframing',
      'Stress inoculation',
      'Social support building',
      'Meaning-making exercises'
    ]
  }
];

export const resourceCategories = [
  {
    id: 'stress-anxiety',
    name: 'Stress & Anxiety',
    icon: 'target',
    color: '#E8F4FD',
    description: 'Tools and techniques for managing stress and anxiety'
  },
  {
    id: 'sleep-wellness',
    name: 'Sleep & Wellness',
    icon: 'moon',
    color: '#F3E8FF',
    description: 'Improve your sleep quality and overall wellness'
  },
  {
    id: 'coping-skills',
    name: 'Coping Skills',
    icon: 'wind',
    color: '#E6FFFA',
    description: 'Practical skills for managing difficult emotions'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: 'brain',
    color: '#F0FFF4',
    description: 'Mindfulness and meditation practices'
  },
  {
    id: 'academic-support',
    name: 'Academic Support',
    icon: 'book-open',
    color: '#FFF8DC',
    description: 'Strategies for academic success and stress management'
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    icon: 'zap',
    color: '#FDF2F8',
    description: 'Techniques for physical and mental relaxation'
  }
];