import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'en' | 'ta' | 'te' | 'hi';

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
}

// Basic offline translations for key UI elements
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.resources': 'Resources',
    'nav.community': 'Community',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.ok': 'OK',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.viewAll': 'View all',
    
    // Home Screen
    'home.greeting.morning': 'Good morning',
    'home.greeting.afternoon': 'Good afternoon',
    'home.greeting.evening': 'Good evening',
    'home.mood.title': 'How are you feeling today?',
    'home.inspiration.title': 'Daily Inspiration',
    'home.articles.title': "Today's Articles",
    
    // Profile
    'profile.title': 'Profile',
    'profile.progress': 'Your Progress',
    'profile.settings': 'Settings & Support',
    'profile.language': 'Language',
    'profile.logout': 'Log Out',
    'profile.emergency': 'Emergency Contacts',
    'profile.daysActive': 'Days Active',
    'profile.resourcesUsed': 'Resources Used',
    'profile.sessionsBooked': 'Sessions Booked',
    'profile.bookSession': 'Book Session',
    'profile.scheduleCounseling': 'Schedule counseling',
    'profile.moodTracking': 'Mood Tracking',
    'profile.viewInsights': 'View insights',
    'profile.notifications': 'Notifications',
    'profile.privacyData': 'Privacy & Data',
    'profile.helpSupport': 'Help & Support',
    'profile.sendFeedback': 'Send Feedback',
    'profile.showUsername': 'Show Username',
    
    // Resources
    'resources.title': 'Mental Health Resources',
    'resources.subtitle': 'Evidence-based tools and information to support your wellbeing',
    
    // Community
    'community.title': 'Community Support',
    'community.guidelines': 'Safe Space Guidelines',
    'community.volunteers': 'Student Volunteers',
    'community.discussions': 'Active Discussions',
    'community.guidelinesText': 'This is a moderated, supportive community. Please be kind and respectful.',
    'community.volunteersText': 'Connect with trained peer volunteers for support and guidance',
    'community.popularTopics': 'Popular Topics',
    'community.noPosts': 'No posts in this category',
    'community.beFirst': 'Be the first to start a conversation',
    'community.createFirstPost': 'Create First Post',
    'community.createPost': 'Create Post',
    'community.category': 'Category',
    'community.placeholder': "Share your thoughts, ask for advice, or start a discussion...",
    'community.remember': 'Remember to be respectful and supportive. Your post will be reviewed before appearing in the community.',
    'community.chatNow': 'Chat Now',
    'community.sendMessage': 'Send Message',
    
    // Chat
    'chat.title': 'AI Mental Health Support',
    'chat.subtitle': '• Available 24/7 • Confidential',
    'chat.startConversation': 'Start a conversation',
    'chat.typing': 'AI is typing...',
    'chat.input.placeholder': 'Type your message...',
    'chat.urgent.label': 'Urgent Support Needed',
    'chat.coping.label': 'Coping Strategy',
    'chat.actions.callHelpline': 'Call Emergency Helpline',
    'chat.actions.bookCounselor': 'Book Counselor',
  },
  ta: {
    // Navigation (Tamil)
    'nav.home': 'முகப்பு',
    'nav.resources': 'வளங்கள்',
    'nav.community': 'சமூகம்',
    'nav.chat': 'அரட்டை',
    'nav.profile': 'சுயவிவரம்',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.cancel': 'ரத்து செய்',
    'common.ok': 'சரி',
    'common.save': 'சேமி',
    'common.close': 'மூடு',
    'common.viewAll': 'அனைத்தையும் பார்க்க',
    
    // Home Screen
    'home.greeting.morning': 'காலை வணக்கம்',
    'home.greeting.afternoon': 'மதிய வணக்கம்',
    'home.greeting.evening': 'மாலை வணக்கம்',
    'home.mood.title': 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?',
    'home.inspiration.title': 'தினசரி உத்வேகம்',
    'home.articles.title': 'இன்றைய கட்டுரைகள்',
    
    // Profile
    'profile.title': 'சுயவிவரம்',
    'profile.progress': 'உங்கள் முன்னேற்றம்',
    'profile.settings': 'அமைப்புகள் மற்றும் ஆதரவு',
    'profile.language': 'மொழி',
    'profile.logout': 'வெளியேறு',
    'profile.emergency': 'அவசர தொடர்புகள்',
    'profile.daysActive': 'செயலில் உள்ள நாட்கள்',
    'profile.resourcesUsed': 'பயன்படுத்திய வளங்கள்',
    'profile.sessionsBooked': 'முன்பதிவு செய்யப்பட்ட அமர்வுகள்',
    'profile.bookSession': 'அமர்வு முன்பதிவு',
    'profile.scheduleCounseling': 'ஆலோசனை திட்டமிடுங்கள்',
    'profile.moodTracking': 'மனநிலை கண்காணிப்பு',
    'profile.viewInsights': 'நுண்ணறிவுகளைப் பார்க்கவும்',
    'profile.notifications': 'அறிவிப்புகள்',
    'profile.privacyData': 'தனியுரிமை மற்றும் தரவு',
    'profile.helpSupport': 'உதவி மற்றும் ஆதரவு',
    'profile.sendFeedback': 'கருத்து அனுப்பவும்',
    'profile.showUsername': 'பயனர்பெயரைக் காட்டு',
    
    // Resources
    'resources.title': 'மனநல வளங்கள்',
    'resources.subtitle': 'உங்கள் நல்வாழ்வை ஆதரிக்க சான்று அடிப்படையிலான கருவிகள் மற்றும் தகவல்கள்',
    
    // Community
    'community.title': 'சமூக ஆதரவு',
    'community.guidelines': 'பாதுகாப்பான இடம் வழிகாட்டுதல்கள்',
    'community.volunteers': 'மாணவர் தன்னார்வலர்கள்',
    'community.discussions': 'செயலில் உள்ள விவாதங்கள்',
    'community.guidelinesText': 'இது ஒரு கட்டுப்படுத்தப்பட்ட, ஆதரவான சமூகம். தயவுசெய்து கருணையுடனும் மரியாதையுடனும் இருங்கள்.',
    'community.volunteersText': 'ஆதரவு மற்றும் வழிகாட்டுதலுக்காக பயிற்சி பெற்ற சக தன்னார்வலர்களுடன் இணைக்கவும்',
    'community.popularTopics': 'பிரபல தலைப்புகள்',
    'community.noPosts': 'இந்த வகையில் பதிவுகள் இல்லை',
    'community.beFirst': 'முதலாவது உரையாடலைத் தொடங்குங்கள்',
    'community.createFirstPost': 'முதல் பதிவை உருவாக்கு',
    'community.createPost': 'பதிவு உருவாக்கு',
    'community.category': 'வகை',
    'community.placeholder': 'உங்கள் எண்ணங்களைப் பகிரவும், ஆலோசனை கேளுங்கள் அல்லது ஒரு விவாதத்தை தொடங்குங்கள்...',
    'community.remember': 'மரியாதையுடனும் ஆதரவுடனும் இருங்கள். உங்கள் பதிவு மதிப்பாய்வுக்குப் பிறகு சமூகத்தில் தோன்றும்.',
    'community.chatNow': 'இப்போது அரட்டை',
    'community.sendMessage': 'செய்தி அனுப்பு',
    
    // Chat
    'chat.title': 'ஏஐ மனநல ஆதரவு',
    'chat.subtitle': '• 24/7 கிடைக்கும் • ரகசியம்',
    'chat.startConversation': 'ஒரு உரையாடலை தொடங்குங்கள்',
    'chat.typing': 'ஏஐ தட்டச்சு செய்கிறது...',
    'chat.input.placeholder': 'உங்கள் செய்தியை உள்ளிடுங்கள்...',
    'chat.urgent.label': 'அவசர உதவி தேவையுள்ளது',
    'chat.coping.label': 'சமாளிக்கும் முறை',
    'chat.actions.callHelpline': 'அவசர உதவி அழைப்பு',
    'chat.actions.bookCounselor': 'ஆலோசகரை முன்பதிவு செய்',
  },
  te: {
    // Navigation (Telugu)
    'nav.home': 'హోమ్',
    'nav.resources': 'వనరులు',
    'nav.community': 'కమ్యూనిటీ',
    'nav.chat': 'చాట్',
    'nav.profile': 'ప్రొఫైల్',
    
    // Common
    'common.loading': 'లోడ్ అవుతోంది...',
    'common.error': 'లోపం',
    'common.success': 'విజయం',
    'common.cancel': 'రద్దు చేయండి',
    'common.ok': 'సరే',
    'common.save': 'సేవ్ చేయండి',
    'common.close': 'మూసివేయండి',
    'common.viewAll': 'అన్నీ చూడండి',
    
    // Home Screen
    'home.greeting.morning': 'శుభోదయం',
    'home.greeting.afternoon': 'శుభ మధ్యాహ్నం',
    'home.greeting.evening': 'శుభ సాయంత్రం',
    'home.mood.title': 'ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?',
    'home.inspiration.title': 'రోజువారీ ప్రేరణ',
    'home.articles.title': 'నేటి వ్యాసాలు',
    
    // Profile
    'profile.title': 'ప్రొఫైల్',
    'profile.progress': 'మీ పురోగతి',
    'profile.settings': 'సెట్టింగ్స్ & సపోర్ట్',
    'profile.language': 'భాష',
    'profile.logout': 'లాగ్ అవుట్',
    'profile.emergency': 'అత్యవసర పరిచయాలు',
    'profile.daysActive': 'క్రియాశీల రోజులు',
    'profile.resourcesUsed': 'ఉపయోగించిన వనరులు',
    'profile.sessionsBooked': 'బుక్ చేసిన సెషన్లు',
    'profile.bookSession': 'సెషన్ బుక్ చేయండి',
    'profile.scheduleCounseling': 'కౌన్సెలింగ్ షెడ్యూల్ చేయండి',
    'profile.moodTracking': 'మూడ్ ట్రాకింగ్',
    'profile.viewInsights': 'అంతర్దృష్టులను చూడండి',
    'profile.notifications': 'నోటిఫికేషన్లు',
    'profile.privacyData': 'గోప్యత & డేటా',
    'profile.helpSupport': 'సహాయం & మద్దతు',
    'profile.sendFeedback': 'ఫీడ్‌బ్యాక్ పంపండి',
    'profile.showUsername': 'యూజర్‌నేమ్ చూపించు',
    
    // Resources
    'resources.title': 'మానసిక ఆరోగ్య వనరులు',
    'resources.subtitle': 'మీ శ్రేయస్సుకు మద్దతు ఇవ్వడానికి సాక్ష్య-ఆధారిత సాధనాలు మరియు సమాచారం',
    
    // Community
    'community.title': 'కమ్యూనిటీ సపోర్ట్',
    'community.guidelines': 'సురక్షిత స్థల మార్గదర్శకాలు',
    'community.volunteers': 'విద్యార్థి వాలంటీర్లు',
    'community.discussions': 'క్రియాశీల చర్చలు',
    'community.guidelinesText': 'ఇది నియంత్రిత, సహాయక సంఘం. దయచేసి దయతో మరియు గౌరవంతో ఉండండి.',
    'community.volunteersText': 'మద్దతు మరియు మార్గదర్శకత్వం కోసం శిక్షణ పొందిన సహచర వాలంటీర్లతో కనెక్ట్ అవ్వండి',
    'community.popularTopics': 'ప్రసిద్ధ విషయాలు',
    'community.noPosts': 'ఈ వర్గంలో పోస్టులు లేవు',
    'community.beFirst': 'మాటల్ని మొదలుపెట్టండి',
    'community.createFirstPost': 'మొదటి పోస్ట్ సృష్టించండి',
    'community.createPost': 'పోస్ట్ సృష్టించండి',
    'community.category': 'వర్గం',
    'community.placeholder': 'మీ ఆలోచనలను పంచుకోండి, సలహా అడగండి లేదా చర్చను ప్రారంభించండి...',
    'community.remember': 'గౌరవపూర్వకంగా మరియు సహాయకరంగా ఉండండి. మీ పోస్ట్ సమీక్ష తర్వాత కమ్యూనిటీలో కనిపిస్తుంది.',
    'community.chatNow': 'ఇప్పుడు చాట్ చేయండి',
    'community.sendMessage': 'సందేశం పంపండి',
    
    // Chat
    'chat.title': 'ఏఐ మానసిక ఆరోగ్య మద్దతు',
    'chat.subtitle': '• 24/7 అందుబాటులో • గోప్యత',
    'chat.startConversation': 'ఒక సంభాషణ ప్రారంభించండి',
    'chat.typing': 'ఏఐ టైప్ చేస్తోంది...',
    'chat.input.placeholder': 'మీ సందేశాన్ని టైప్ చేయండి...',
    'chat.urgent.label': 'తక్షణ మద్దతు అవసరం',
    'chat.coping.label': 'సామర్థ్య వ్యూహం',
    'chat.actions.callHelpline': 'అత్యవసర హెల్ప్‌లైన్ కాల్',
    'chat.actions.bookCounselor': 'కౌన్సిలర్ బుక్ చేయండి',
  },
  hi: {
    // Navigation (Hindi)
    'nav.home': 'होम',
    'nav.resources': 'संसाधन',
    'nav.community': 'समुदाय',
    'nav.chat': 'चैट',
    'nav.profile': 'प्रोफ़ाइल',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.ok': 'ठीक है',
    'common.save': 'सेव करें',
    'common.close': 'बंद करें',
    'common.viewAll': 'सभी देखें',
    
    // Home Screen
    'home.greeting.morning': 'सुप्रभात',
    'home.greeting.afternoon': 'नमस्कार',
    'home.greeting.evening': 'शुभ संध्या',
    'home.mood.title': 'आज आप कैसा महसूस कर रहे हैं?',
    'home.inspiration.title': 'दैनिक प्रेरणा',
    'home.articles.title': 'आज के लेख',
    
    // Profile
    'profile.title': 'प्रोफ़ाइल',
    'profile.progress': 'आपकी प्रगति',
    'profile.settings': 'सेटिंग्स और सहायता',
    'profile.language': 'भाषा',
    'profile.logout': 'लॉग आउट',
    'profile.emergency': 'आपातकालीन संपर्क',
    'profile.daysActive': 'सक्रिय दिन',
    'profile.resourcesUsed': 'उपयोग किए गए संसाधन',
    'profile.sessionsBooked': 'बुक किए गए सत्र',
    'profile.bookSession': 'सत्र बुक करें',
    'profile.scheduleCounseling': 'परामर्श शेड्यूल करें',
    'profile.moodTracking': 'मूड ट्रैकिंग',
    'profile.viewInsights': 'अंतर्दृष्टि देखें',
    'profile.notifications': 'सूचनाएं',
    'profile.privacyData': 'गोपनीयता और डेटा',
    'profile.helpSupport': 'सहायता और समर्थन',
    'profile.sendFeedback': 'फीडबैक भेजें',
    'profile.showUsername': 'उपयोगकर्ता नाम दिखाएं',
    
    // Resources
    'resources.title': 'मानसिक स्वास्थ्य संसाधन',
    'resources.subtitle': 'आपकी भलाई का समर्थन करने के लिए साक्ष्य-आधारित उपकरण और जानकारी',
    
    // Community
    'community.title': 'समुदायिक सहायता',
    'community.guidelines': 'सुरक्षित स्थान दिशानिर्देश',
    'community.volunteers': 'छात्र स्वयंसेवक',
    'community.discussions': 'सक्रिय चर्चाएं',
    'community.guidelinesText': 'यह एक नियंत्रित, सहायक समुदाय है। कृपया दयालु और सम्मानजनक रहें।',
    'community.volunteersText': 'समर्थन और मार्गदर्शन के लिए प्रशिक्षित सहकर्मी स्वयंसेवकों से जुड़ें',
    'community.popularTopics': 'लोकप्रिय विषय',
    'community.noPosts': 'इस श्रेणी में कोई पोस्ट नहीं',
    'community.beFirst': 'बातचीत शुरू करने वाले पहले व्यक्ति बनें',
    'community.createFirstPost': 'पहली पोस्ट बनाएं',
    'community.createPost': 'पोस्ट बनाएं',
    'community.category': 'श्रेणी',
    'community.placeholder': 'अपने विचार साझा करें, सलाह मांगें या चर्चा शुरू करें...',
    'community.remember': 'कृपया सम्मानजनक और सहायक बनें। आपकी पोस्ट समीक्षा के बाद दिखाई देगी।',
    'community.chatNow': 'अभी चैट करें',
    'community.sendMessage': 'संदेश भेजें',
    
    // Chat
    'chat.title': 'एआई मानसिक स्वास्थ्य सहायता',
    'chat.subtitle': '• 24/7 उपलब्ध • गोपनीय',
    'chat.startConversation': 'संबंध बनाना शुरू करें',
    'chat.typing': 'एआई लिख रहा है...',
    'chat.input.placeholder': 'अपना संदेश लिखें...',
    'chat.urgent.label': 'तत्काल सहायता आवश्यक',
    'chat.coping.label': 'सम्भालने की रणनीति',
    'chat.actions.callHelpline': 'आपातकालीन हेल्पलाइन कॉल',
    'chat.actions.bookCounselor': 'काउंसलर बुक करें',
  },
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && ['en', 'ta', 'te', 'hi'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage as SupportedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    if (!language || typeof language !== 'string') return;
    if (!['en', 'ta', 'te', 'hi'].includes(language)) return;
    
    try {
      await AsyncStorage.setItem('app_language', language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, []);

  const t = useCallback((key: string): string => {
    if (!key || typeof key !== 'string') return key;
    const translation = translations[currentLanguage]?.[key];
    return translation || translations.en[key] || key;
  }, [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    setLanguage,
    t,
  }), [currentLanguage, setLanguage, t]);
});