// Mock API client for development
const MOCK_DELAY = 500;

const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

const mockData = {
  example: { message: "Hello from mock API!", timestamp: new Date().toISOString() },
  resources: { resources: [] },
  students: { students: [] },
  counselorApplications: { applications: [] },
  helplines: { helplines: [] },
  reports: { reports: [] },
  activities: { activities: [] },
  volunteers: { volunteers: [] },
};

console.log("[API] Using mock API client");

class MockApiClient {
  private async mockRequest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
    console.log(`[MockAPI] ${method} ${endpoint}`, data ? { data } : '');
    
    // Simulate network delay
    await mockDelay();
    
    // Return mock data based on endpoint
    if (endpoint.includes('/example')) {
      return mockData.example as T;
    }
    if (endpoint.includes('/resources')) {
      if (method === 'POST') {
        return { success: true, id: Date.now(), ...data } as T;
      }
      return mockData.resources as T;
    }
    if (endpoint.includes('/students')) {
      return mockData.students as T;
    }
    if (endpoint.includes('/counselor/applications')) {
      return mockData.counselorApplications as T;
    }
    if (endpoint.includes('/helplines')) {
      return mockData.helplines as T;
    }
    if (endpoint.includes('/reports')) {
      return mockData.reports as T;
    }
    if (endpoint.includes('/activities')) {
      return mockData.activities as T;
    }
    if (endpoint.includes('/volunteers')) {
      return mockData.volunteers as T;
    }
    
    // Default response
    return { success: true, message: 'Mock response' } as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.mockRequest<T>(endpoint, 'GET');
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.mockRequest<T>(endpoint, 'POST', data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.mockRequest<T>(endpoint, 'PUT', data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.mockRequest<T>(endpoint, 'DELETE');
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

export const apiClient = new MockApiClient();
export default apiClient;