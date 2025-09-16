import { ChatCondition } from '@/types/ai-chat';

export const chatResponses = {
  welcome: {
    title: "Welcome to MindCare - Your Mental Health Support Companion",
    message: "I'm here to help you navigate through your mental health concerns with personalized support and activities.\n\nThis is a safe space where you can share how you're feeling and receive immediate guidance tailored to your needs."
  },
  
  initialAssessment: {
    message: "Hi there! I'm here to support you. To better help you, could you please tell me what you're experiencing right now?",
    options: ['Stress', 'Anxiety', 'Depression', 'Sleep Issues', 'Emergency']
  },
  
  emergency: {
    message: `I understand you're going through a crisis right now, and I want you to know that help is available immediately. Your safety and well-being are the top priority.

🚨 **IMMEDIATE ACTIONS:**
• Contact a mental health professional or counselor right away
• Reach out to your campus counseling center
• Call a crisis helpline if you're in immediate danger

📞 **Emergency Resources:**
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Campus Counseling Center: Available 24/7

Please don't hesitate to reach out for professional help. You matter, and there are people who want to support you through this difficult time.`,
    options: ['Contact Counselor', 'Get Help Resources']
  },
  
  firstActivities: {
    stress: {
      title: "5-Minute Deep Breathing Exercise",
      message: `I understand you're feeling stressed. Let's try a simple but effective technique to help you feel more centered.

🌱 **5-Minute Deep Breathing Exercise:**
• Find a comfortable position and close your eyes
• Breathe in slowly through your nose for 4 counts
• Hold your breath for 4 counts
• Exhale slowly through your mouth for 6 counts
• Repeat this cycle for 5 minutes
• Focus only on your breathing and let other thoughts pass by

This technique helps activate your body's relaxation response and can quickly reduce stress levels.`
    },
    anxiety: {
      title: "5-4-3-2-1 Grounding Technique",
      message: `I hear that you're feeling anxious. Let's try a grounding technique that can help bring you back to the present moment.

🌟 **5-4-3-2-1 Grounding Technique:**
• Look around and name 5 things you can see
• Listen and identify 4 things you can hear
• Touch and notice 3 things you can feel
• Find 2 things you can smell
• Think of 1 thing you can taste

This technique helps interrupt anxious thoughts by focusing your attention on your immediate environment and senses.`
    },
    depression: {
      title: "Gratitude Reflection",
      message: `I understand you're going through a tough time with depression. Let's start with a small but meaningful activity that can help lift your mood slightly.

💝 **Gratitude Reflection:**
• Take a moment to think about your day
• Write down or think of 3 small things you're grateful for today
• They can be tiny things like a warm cup of coffee, a text from a friend, or simply having a roof over your head
• Spend a moment really focusing on each one and how it made you feel

This practice helps shift your brain's focus toward positive aspects of your life, even during difficult times.`
    },
    sleep: {
      title: "Digital Sunset Routine",
      message: `I understand you're having trouble with sleep. Let's start with a simple change that can significantly improve your sleep quality.

🌙 **Digital Sunset Routine:**
• Turn off all screens (phone, laptop, TV) 30 minutes before your intended bedtime
• Dim the lights in your room
• Try a calming activity like reading a book, gentle stretching, or listening to soft music
• Keep your bedroom cool and comfortable
• Avoid caffeine 4-6 hours before bed

This helps your brain naturally produce melatonin and prepare for rest.`
    }
  },
  
  statusCheck: {
    message: "Please try this activity and let me know - did this help you feel better?",
    options: ['Yes, I feel better', 'No, I still need more help']
  },
  
  success: {
    message: `That's wonderful to hear! I'm so glad this technique helped you feel better. Remember, these small steps can make a big difference in your mental health.

✨ **Keep in mind:**
• Practice makes perfect - the more you use these techniques, the more effective they become
• It's normal to have ups and downs
• You've shown great strength by seeking help and trying new strategies
• I'm always here if you need support again

Take care of yourself, and remember that prioritizing your mental health is a sign of strength, not weakness. You've got this! 💪`,
    options: ['Start New Conversation']
  },
  
  advancedActivities: {
    stress: {
      title: "Progressive Muscle Relaxation",
      message: `I understand the first technique didn't provide enough relief. Let's try a more comprehensive approach to managing your stress.

🧘 **Progressive Muscle Relaxation:**
• Lie down in a quiet space
• Starting with your toes, tense each muscle group for 5 seconds, then release
• Work your way up: feet, calves, thighs, glutes, abdomen, chest, arms, shoulders, neck, face
• As you release each muscle group, notice the contrast between tension and relaxation
• Take deep breaths throughout the process
• This should take about 15-20 minutes

**Additional Stress Management:**
• Write down what's causing your stress
• Break large problems into smaller, manageable steps
• Consider talking to a trusted friend or family member
• Make sure you're getting enough sleep and eating regularly`
    },
    anxiety: {
      title: "Mindfulness Meditation",
      message: `Let's try a more intensive technique to help manage your anxiety more effectively.

🧠 **Mindfulness Meditation (10 minutes):**
• Sit comfortably and close your eyes
• Focus on your breath without trying to change it
• When anxious thoughts arise, acknowledge them without judgment: 'I notice I'm having an anxious thought'
• Gently redirect your attention back to your breathing
• If your mind wanders, that's normal - just guide it back
• Continue for 10 minutes

**Anxiety Management Strategies:**
• Challenge negative thoughts: Ask yourself 'Is this thought realistic?'
• Practice self-compassion - treat yourself like you would a good friend
• Limit caffeine and alcohol as they can increase anxiety
• Consider keeping an anxiety journal to identify triggers`
    },
    depression: {
      title: "Emotional Journaling",
      message: `Let's try a more structured approach to help lift your mood and process your feelings.

📝 **Emotional Journaling (15 minutes):**
• Find a quiet space and get a notebook or open a document
• Write about how you're feeling right now without censoring yourself
• Ask yourself: What triggered these feelings? What thoughts keep repeating?
• Write down one small thing you can do today to take care of yourself
• End by writing one thing you're looking forward to, even if it's small

**Additional Support Strategies:**
• Try to maintain a basic routine (showering, eating, sleeping)
• Reach out to one person you trust - isolation makes depression worse
• Consider light physical activity, even just a 5-minute walk
• Remember: depression lies to you - your negative thoughts aren't facts`
    },
    sleep: {
      title: "Complete Sleep Hygiene Routine",
      message: `Let's create a more comprehensive sleep improvement plan for you.

📋 **Complete Sleep Hygiene Routine:**
• Set a consistent bedtime and wake time, even on weekends
• Create a pre-sleep ritual: dim lights, no screens, calming activities
• Make your bedroom a sleep sanctuary: cool (65-68°F), dark, and quiet
• If you can't fall asleep within 20 minutes, get up and do a quiet activity until sleepy
• Avoid large meals, alcohol, and exercise 3 hours before bed
• Get morning sunlight exposure to regulate your circadian rhythm

**Sleep Journal:**
• Track your sleep patterns for a week
• Note what you did before bed and how you slept
• Identify patterns that help or hurt your sleep quality`
    }
  },
  
  secondStatusCheck: {
    message: "Please try this more comprehensive approach and let me know - did this help you feel better?",
    options: ['Yes, I feel much better', 'No, I still need professional help']
  },
  
  professionalHelp: {
    message: `I hear you, and I want you to know that it takes courage to recognize when you need additional support. Sometimes our mental health challenges require professional guidance, and that's completely okay.

🤝 **Next Steps - Professional Support:**
• **Campus Counseling Center:** Most schools offer free counseling services for students
• **Mental Health Professionals:** Consider booking a session with a licensed therapist or counselor
• **Support Groups:** Look for peer support groups in your area or online
• **Trusted Adults:** Talk to a professor, advisor, or family member you trust

📞 **Helpful Resources:**
• National Alliance on Mental Illness (NAMI): 1-800-950-NAMI (6264)
• Crisis Text Line: Text HOME to 741741
• Psychology Today Therapist Finder: psychologytoday.com
• Your Student Health Services

Remember: Seeking professional help is a sign of strength and self-awareness. You deserve support, and there are people trained specifically to help you through this. You don't have to face this alone.`,
    options: ['Find Counselor', 'Get Resources']
  }
};