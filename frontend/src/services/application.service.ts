import api from './api';

export interface MembershipApplication {
  id: string;
  userId: string;
  birthDate: string;
  statusType: string;
  fieldOfStudy: string;
  hasPastExperience: boolean;
  pastExperienceDetails?: string;
  skills: string;
  motivation: string;
  discoveryChannel: string[];
  availability: string[];
  readyForResponsibility: boolean;
  status: 'pending' | 'interviewed' | 'approved' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export const submitApplication = async (data: any) => {
  const response = await api.post<{ success: boolean; data: MembershipApplication }>('/applications', data);
  return response.data;
};

export const getMyApplication = async () => {
  const response = await api.get<{ success: boolean; data: MembershipApplication | null }>('/applications/my-application');
  return response.data;
};

export const getAllApplications = async () => {
  const response = await api.get<{ success: boolean; data: MembershipApplication[] }>('/applications');
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: 'pending' | 'interviewed' | 'approved' | 'rejected') => {
  const response = await api.put<{ success: boolean; data: MembershipApplication }>(`/applications/${id}/status`, { status });
  return response.data;
};
