export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'article' | 'exercise';
  category: string;
  duration?: string;
  thumbnail: string;
  url: string;
  language: string;
  tags: string[];
}