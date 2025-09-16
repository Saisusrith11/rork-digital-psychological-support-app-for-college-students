import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  address: string;
  verified: boolean;
  registeredAt: string;
  phone?: string;
  skills?: string[];
  availability?: string;
}

const mockVolunteers: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    address: '123 Main St, Chennai, Tamil Nadu',
    verified: false,
    registeredAt: '2025-09-10T10:00:00Z',
    phone: '+91 9876543210',
    skills: ['Counseling', 'Mental Health Support'],
    availability: 'Weekdays 6PM-9PM'
  },
  {
    id: 'vol-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    address: '456 Park Ave, Bangalore, Karnataka',
    verified: true,
    registeredAt: '2025-09-08T14:30:00Z',
    phone: '+91 9876543211',
    skills: ['Peer Support', 'Active Listening'],
    availability: 'Weekends'
  },
  {
    id: 'vol-3',
    name: 'Raj Kumar',
    email: 'raj.kumar@example.com',
    address: '789 Lake View, Hyderabad, Telangana',
    verified: false,
    registeredAt: '2025-09-15T09:15:00Z',
    phone: '+91 9876543212',
    skills: ['Crisis Support', 'Student Mentoring'],
    availability: 'Flexible'
  },
  {
    id: 'vol-4',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    address: '321 Garden Road, Delhi',
    verified: true,
    registeredAt: '2025-09-12T11:45:00Z',
    phone: '+91 9876543213',
    skills: ['Academic Support', 'Stress Management'],
    availability: 'Monday to Friday 4PM-7PM'
  }
];

let volunteersData = [...mockVolunteers];

export const getAllVolunteers = protectedProcedure
  .query(async ({ ctx }) => {
    if (ctx.user?.role !== 'counselor' && ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized: Only counselors and admins can view volunteers');
    }
    
    return {
      volunteers: volunteersData,
      total: volunteersData.length
    };
  });

export const updateVolunteerStatus = protectedProcedure
  .input(z.object({
    volunteerId: z.string(),
    verified: z.boolean()
  }))
  .mutation(async ({ ctx, input }) => {
    if (ctx.user?.role !== 'counselor' && ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized: Only counselors and admins can update volunteer status');
    }
    
    const volunteerIndex = volunteersData.findIndex(v => v.id === input.volunteerId);
    
    if (volunteerIndex === -1) {
      throw new Error('Volunteer not found');
    }
    
    volunteersData[volunteerIndex].verified = input.verified;
    
    return {
      success: true,
      volunteer: volunteersData[volunteerIndex]
    };
  });