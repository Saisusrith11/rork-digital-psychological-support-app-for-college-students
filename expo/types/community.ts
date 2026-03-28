export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  category: 'academic' | 'wellness' | 'social';
  tags: string[];
  likes: number;
  replies: number;
  createdAt: string;
  isAnonymous: boolean;
}

export interface CommunityReply {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  createdAt: string;
  isAnonymous: boolean;
}