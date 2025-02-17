export interface Credential {
  id: string;
  platform: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}