import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { 
  MessageSquare, 
  User, 
  Clock,
  Send,
  Phone,
  Video
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CounselorChat() {
  const insets = useSafeAreaInsets();

  const conversations = [
    {
      id: '1',
      studentId: 'student_001',
      studentName: 'Anonymous Student',
      lastMessage: 'Thank you for the session today. I feel much better.',
      lastMessageTime: '2 hours ago',
      unreadCount: 0,
      isOnline: false,
      language: 'English',
    },
    {
      id: '2',
      studentId: 'student_002',
      studentName: 'Student #2847',
      lastMessage: 'Can we schedule another session for next week?',
      lastMessageTime: '1 day ago',
      unreadCount: 2,
      isOnline: true,
      language: 'Tamil',
    },
    {
      id: '3',
      studentId: 'student_003',
      studentName: 'Anonymous Student',
      lastMessage: 'I need urgent help with anxiety management',
      lastMessageTime: '3 days ago',
      unreadCount: 1,
      isOnline: false,
      language: 'Hindi',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Communicate with your students</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.conversationsSection}>
          <Text style={styles.sectionTitle}>Active Conversations</Text>
          
          {conversations.map((conversation) => (
            <TouchableOpacity key={conversation.id} style={styles.conversationCard}>
              <View style={styles.conversationHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.avatarContainer}>
                    <User size={20} color={Colors.text.white} />
                    {conversation.isOnline && <View style={styles.onlineIndicator} />}
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{conversation.studentName}</Text>
                    <Text style={styles.languageText}>Language: {conversation.language}</Text>
                  </View>
                </View>
                
                <View style={styles.conversationMeta}>
                  <Text style={styles.timeText}>{conversation.lastMessageTime}</Text>
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.lastMessage} numberOfLines={2}>
                {conversation.lastMessage}
              </Text>

              <View style={styles.conversationActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageSquare size={16} color={Colors.primary} />
                  <Text style={styles.actionButtonText}>Reply</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Phone size={16} color={Colors.success} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Video size={16} color={Colors.secondary} />
                  <Text style={styles.actionButtonText}>Video</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <Send size={24} color={Colors.primary} />
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Send Broadcast</Text>
              <Text style={styles.quickActionSubtitle}>Send message to all students</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <Clock size={24} color={Colors.warning} />
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Schedule Message</Text>
              <Text style={styles.quickActionSubtitle}>Send reminders and follow-ups</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  conversationsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  conversationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  languageText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: Colors.text.light,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  conversationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionContent: {
    marginLeft: 16,
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});