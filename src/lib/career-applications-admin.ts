import { supabase } from './supabase';
import type { ApplicationStatus, CareerApplicationRow } from '../types/cms';

const selectCols =
  'id, job_id, job_title, full_name, email, portfolio_url, resume_url, resume_name, cover_letter, status, submitted_at, created_at, updated_at';

export const fetchCareerApplicationsAdmin = async (): Promise<CareerApplicationRow[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('career_applications')
    .select(selectCols)
    .order('submitted_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CareerApplicationRow[];
};

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<void> => {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase.from('career_applications').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  received: 'Received',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired'
};
