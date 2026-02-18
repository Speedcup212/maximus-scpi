export type ProfileRole = 'client' | 'partner' | 'admin';
export type ProfileStatus = 'pending' | 'active' | 'suspended';

export type Profile = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  org_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  status: 'active' | 'suspended';
  created_at: string;
};

export type CaseStatus = 'new' | 'in_progress' | 'sent' | 'closed';

export type Case = {
  id: string;
  client_user_id: string;
  org_id: string | null;
  title: string;
  status: CaseStatus;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type CaseNote = {
  id: string;
  case_id: string;
  author_user_id: string;
  note_type: 'compte_rendu' | 'hypotheses' | 'actions' | 'misc';
  content_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CasePdf = {
  id: string;
  case_id: string;
  generated_by_user_id: string;
  version: number;
  title: string;
  storage_path: string;
  created_at: string;
};
