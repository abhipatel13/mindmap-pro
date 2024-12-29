export interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MindMap {
  id: string;
  title: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  mindmap_id: string;
  parent_id?: string;
  content: string;
  position_x: number;
  position_y: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string;
  target: string;
}

export interface Collaborator {
  mindmap_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  created_at: string;
}