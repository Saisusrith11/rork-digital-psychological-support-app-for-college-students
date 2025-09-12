export const Colors = {
  primary: '#20B2AA',
  primaryLight: '#4ECDC4',
  secondary: '#6C63FF',
  accent: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  background: '#F8FFFE',
  surface: '#FFFFFF',
  surfaceLight: '#F5F5F5',
  
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    light: '#BDC3C7',
    white: '#FFFFFF',
  },
  
  mood: {
    great: '#4CAF50',
    good: '#8BC34A',
    okay: '#FFC107',
    low: '#FF9800',
    hard: '#2196F3',
  },
  
  crisis: {
    background: '#FFF5F5',
    border: '#FED7D7',
    text: '#C53030',
  },
  
  coping: {
    breathing: '#3B82F6',
    mindfulness: '#8B5CF6',
    grounding: '#10B981',
    sleep: '#6366F1',
    academic: '#F59E0B',
  },
  
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
  }
};

export default {
  light: {
    text: Colors.text.primary,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.text.light,
    tabIconSelected: Colors.primary,
  },
};