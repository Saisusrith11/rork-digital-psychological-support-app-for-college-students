import Constants from "expo-constants";
import { Platform } from "react-native";

const normalizeToHttpOrigin = (uri: string): string => {
  if (!uri) return "";
  let candidate = uri.trim();
  if (candidate.startsWith("exp://")) candidate = candidate.replace("exp://", "http://");
  if (candidate.startsWith("https://") || candidate.startsWith("http://")) {
    try {
      const u = new URL(candidate);
      return u.origin;
    } catch {
      return "";
    }
  }
  if (candidate.includes("/")) {
    candidate = candidate.split("/")[0];
  }
  return `http://${candidate}`;
};

const getBaseUrl = () => {
  // For production, use the environment variable
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // For web development
  if (Platform.OS === "web") {
    try {
      const origin = (globalThis as any)?.location?.origin as string | undefined;
      if (origin) return origin;
    } catch {}
    return "http://localhost:3000";
  }
  
  // For mobile development
  const hostUri =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.manifest?.hostUri ||
    (Constants as any)?.linkingUri;
  
  if (typeof hostUri === "string" && hostUri.length > 0) {
    const base = normalizeToHttpOrigin(hostUri);
    return base;
  }
  
  // Fallback for development
  return "http://localhost:3000";
};

const baseUrl = getBaseUrl();
const apiUrl = `${baseUrl}/api`;

console.log("[API] baseUrl:", baseUrl, "apiUrl:", apiUrl);

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`[API] ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API] Error calling ${endpoint}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods
  async getExample() {
    return this.get('/example/hi');
  }

  async getResources() {
    return this.get('/resources');
  }

  async getResourceById(id: string) {
    return this.get(`/resources/${id}`);
  }

  async createResource(data: any) {
    return this.post('/resources', data);
  }

  async updateResource(id: string, data: any) {
    return this.put(`/resources/${id}`, data);
  }

  async deleteResource(id: string) {
    return this.delete(`/resources/${id}`);
  }

  async getStudents() {
    return this.get('/students');
  }

  async getStudentsByCollege(collegeId: string) {
    return this.get(`/students/college/${collegeId}`);
  }

  async updateStudentRiskLevel(studentId: string, riskLevel: string) {
    return this.put(`/students/${studentId}/risk`, { riskLevel });
  }

  async getCounselorApplications() {
    return this.get('/counselor/applications');
  }

  async submitCounselorApplication(data: any) {
    return this.post('/counselor/applications', data);
  }

  async reviewCounselorApplication(id: string, decision: string, feedback?: string) {
    return this.put(`/counselor/applications/${id}/review`, { decision, feedback });
  }

  async startChat(studentId: string) {
    return this.post('/chat/start', { studentId });
  }

  async sendMessage(conversationId: string, message: string) {
    return this.post('/chat/message', { conversationId, message });
  }

  async getChatMessages(conversationId: string) {
    return this.get(`/chat/${conversationId}/messages`);
  }

  async getActiveConversations() {
    return this.get('/chat/active');
  }

  async submitConsent(data: any) {
    return this.post('/consent', data);
  }

  async getConsentedAssessments() {
    return this.get('/consent/assessments');
  }

  async syncAssessments(data: any) {
    return this.post('/assessments/sync', data);
  }

  async getStudentAssessments(studentId: string) {
    return this.get(`/assessments/student/${studentId}`);
  }

  async getHelplines() {
    return this.get('/helplines');
  }

  async getReports() {
    return this.get('/reports');
  }

  async getActivities() {
    return this.get('/activities');
  }

  async getVolunteers() {
    return this.get('/volunteers');
  }

  async updateVolunteerStatus(id: string, status: string) {
    return this.put(`/volunteers/${id}/status`, { status });
  }
}

export const apiClient = new ApiClient(apiUrl);
export default apiClient;