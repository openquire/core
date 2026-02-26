export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          parent_id: string | null
          title: string
          content: string
          icon: string | null
          sort_order: number
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          parent_id?: string | null
          title?: string
          content?: string
          icon?: string | null
          sort_order?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          parent_id?: string | null
          title?: string
          content?: string
          icon?: string | null
          sort_order?: number
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pages_workspace_id_fkey'
            columns: ['workspace_id']
            referencedRelation: 'workspaces'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pages_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'pages'
            referencedColumns: ['id']
          }
        ]
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      page_tags: {
        Row: {
          id: string
          page_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'page_tags_page_id_fkey'
            columns: ['page_id']
            referencedRelation: 'pages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'page_tags_tag_id_fkey'
            columns: ['tag_id']
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Workspace types
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
export type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update']

// Page types
export type Page = Database['public']['Tables']['pages']['Row']
export type PageInsert = Database['public']['Tables']['pages']['Insert']
export type PageUpdate = Database['public']['Tables']['pages']['Update']

// Tag types
export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

// Page tag types
export type PageTag = Database['public']['Tables']['page_tags']['Row']
export type PageTagInsert = Database['public']['Tables']['page_tags']['Insert']

// Derived types for UI
export interface PageWithTags extends Page {
  tags: Tag[]
}

export interface PageTreeNode extends PageWithTags {
  children: PageTreeNode[]
}
