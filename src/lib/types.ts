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
  parent_id?: string | null;
  content: string;
  position_x: number;
  position_y: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface Collaborator {
  mindmap_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Profile>;
      };
      mindmaps: {
        Row: MindMap;
        Insert: Omit<MindMap, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<MindMap>;
      };
      mindmap_nodes: {
        Row: Node;
        Insert: Omit<Node, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Node>;
      };
    };
  };
};