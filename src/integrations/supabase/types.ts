export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_memory: {
        Row: {
          access_count: number | null
          agent_id: string | null
          conversation_id: string | null
          created_at: string | null
          embedding_data: Json | null
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          key: string
          last_accessed_at: string | null
          memory_type: Database["public"]["Enums"]["memory_type"] | null
          metadata: Json | null
          relevance_score: number | null
          scope: Database["public"]["Enums"]["memory_scope"] | null
          source: string | null
          source_reference: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          access_count?: number | null
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          embedding_data?: Json | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          key: string
          last_accessed_at?: string | null
          memory_type?: Database["public"]["Enums"]["memory_type"] | null
          metadata?: Json | null
          relevance_score?: number | null
          scope?: Database["public"]["Enums"]["memory_scope"] | null
          source?: string | null
          source_reference?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          access_count?: number | null
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          embedding_data?: Json | null
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          key?: string
          last_accessed_at?: string | null
          memory_type?: Database["public"]["Enums"]["memory_type"] | null
          metadata?: Json | null
          relevance_score?: number | null
          scope?: Database["public"]["Enums"]["memory_scope"] | null
          source?: string | null
          source_reference?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          access_count: number | null
          address: Json | null
          avatar_url: string | null
          categories: Database["public"]["Enums"]["contact_category"][] | null
          category_meta: Json | null
          created_at: string | null
          created_by_agent: string | null
          department: string | null
          email: string | null
          external_id: string | null
          external_provider:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          job_title: string | null
          last_accessed_by: string[] | null
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          preferences: Json | null
          social_profiles: Json | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          address?: Json | null
          avatar_url?: string | null
          categories?: Database["public"]["Enums"]["contact_category"][] | null
          category_meta?: Json | null
          created_at?: string | null
          created_by_agent?: string | null
          department?: string | null
          email?: string | null
          external_id?: string | null
          external_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          job_title?: string | null
          last_accessed_by?: string[] | null
          name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          preferences?: Json | null
          social_profiles?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          address?: Json | null
          avatar_url?: string | null
          categories?: Database["public"]["Enums"]["contact_category"][] | null
          category_meta?: Json | null
          created_at?: string | null
          created_by_agent?: string | null
          department?: string | null
          email?: string | null
          external_id?: string | null
          external_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          job_title?: string | null
          last_accessed_by?: string[] | null
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          preferences?: Json | null
          social_profiles?: Json | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_folders: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          agent_permissions: Json | null
          ai_analysis: Json | null
          analyzed_at: string | null
          checksum: string | null
          created_at: string | null
          external_id: string | null
          extracted_text: string | null
          file_type: Database["public"]["Enums"]["document_type"] | null
          file_url: string
          folder_id: string | null
          id: string
          is_archived: boolean | null
          is_processed: boolean | null
          last_relevance_calc: string | null
          mime_type: string | null
          name: string
          relevance_score: number | null
          size_bytes: number | null
          storage_path: string | null
          storage_provider:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          summary: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          agent_permissions?: Json | null
          ai_analysis?: Json | null
          analyzed_at?: string | null
          checksum?: string | null
          created_at?: string | null
          external_id?: string | null
          extracted_text?: string | null
          file_type?: Database["public"]["Enums"]["document_type"] | null
          file_url: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_processed?: boolean | null
          last_relevance_calc?: string | null
          mime_type?: string | null
          name: string
          relevance_score?: number | null
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          agent_permissions?: Json | null
          ai_analysis?: Json | null
          analyzed_at?: string | null
          checksum?: string | null
          created_at?: string | null
          external_id?: string | null
          extracted_text?: string | null
          file_type?: Database["public"]["Enums"]["document_type"] | null
          file_url?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_processed?: boolean | null
          last_relevance_calc?: string | null
          mime_type?: string | null
          name?: string
          relevance_score?: number | null
          size_bytes?: number | null
          storage_path?: string | null
          storage_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          summary?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_config: {
        Row: {
          api_key_secret_name: string | null
          bucket_name: string | null
          created_at: string | null
          data_type: string
          endpoint_url: string | null
          fallback_provider:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          provider: Database["public"]["Enums"]["storage_provider"] | null
          region: string | null
          sync_enabled: boolean | null
          sync_interval_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key_secret_name?: string | null
          bucket_name?: string | null
          created_at?: string | null
          data_type: string
          endpoint_url?: string | null
          fallback_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: Database["public"]["Enums"]["storage_provider"] | null
          region?: string | null
          sync_enabled?: boolean | null
          sync_interval_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key_secret_name?: string | null
          bucket_name?: string | null
          created_at?: string | null
          data_type?: string
          endpoint_url?: string | null
          fallback_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          provider?: Database["public"]["Enums"]["storage_provider"] | null
          region?: string | null
          sync_enabled?: boolean | null
          sync_interval_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          completed_at: string | null
          conflict_data: Json | null
          created_at: string | null
          data_type: string
          error_message: string | null
          id: string
          record_id: string
          resolved_by: string | null
          source_provider: Database["public"]["Enums"]["storage_provider"]
          started_at: string | null
          status: string | null
          target_provider: Database["public"]["Enums"]["storage_provider"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conflict_data?: Json | null
          created_at?: string | null
          data_type: string
          error_message?: string | null
          id?: string
          record_id: string
          resolved_by?: string | null
          source_provider: Database["public"]["Enums"]["storage_provider"]
          started_at?: string | null
          status?: string | null
          target_provider: Database["public"]["Enums"]["storage_provider"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conflict_data?: Json | null
          created_at?: string | null
          data_type?: string
          error_message?: string | null
          id?: string
          record_id?: string
          resolved_by?: string | null
          source_provider?: Database["public"]["Enums"]["storage_provider"]
          started_at?: string | null
          status?: string | null
          target_provider?: Database["public"]["Enums"]["storage_provider"]
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_minutes: number | null
          agent_notes: Json | null
          assignee_agent: string | null
          assignee_contact_id: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          completed_subtask_count: number | null
          created_at: string | null
          created_by_agent: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_minutes: number | null
          external_id: string | null
          external_provider:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id: string
          is_recurring: boolean | null
          last_worked_by_agent: string | null
          linked_contact_ids: string[] | null
          linked_document_ids: string[] | null
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          progress_percent: number | null
          project: string | null
          recurrence_rule: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          subtask_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          agent_notes?: Json | null
          assignee_agent?: string | null
          assignee_contact_id?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completed_subtask_count?: number | null
          created_at?: string | null
          created_by_agent?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          external_id?: string | null
          external_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_recurring?: boolean | null
          last_worked_by_agent?: string | null
          linked_contact_ids?: string[] | null
          linked_document_ids?: string[] | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percent?: number | null
          project?: string | null
          recurrence_rule?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          subtask_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          agent_notes?: Json | null
          assignee_agent?: string | null
          assignee_contact_id?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completed_subtask_count?: number | null
          created_at?: string | null
          created_by_agent?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          external_id?: string | null
          external_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          id?: string
          is_recurring?: boolean | null
          last_worked_by_agent?: string | null
          linked_contact_ids?: string[] | null
          linked_document_ids?: string[] | null
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          progress_percent?: number | null
          project?: string | null
          recurrence_rule?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          subtask_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_contact_id_fkey"
            columns: ["assignee_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
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
      contact_category:
        | "personal"
        | "business"
        | "client"
        | "vendor"
        | "legal"
        | "influencer"
        | "team"
        | "other"
      document_type:
        | "csv"
        | "pdf"
        | "docx"
        | "doc"
        | "txt"
        | "xlsx"
        | "xls"
        | "png"
        | "jpg"
        | "jpeg"
        | "gif"
        | "webp"
        | "svg"
        | "json"
        | "md"
        | "html"
        | "zip"
        | "video"
        | "audio"
        | "other"
      memory_scope: "global" | "agent" | "task" | "session" | "conversation"
      memory_type:
        | "fact"
        | "preference"
        | "context"
        | "instruction"
        | "learned"
        | "summary"
      storage_provider:
        | "lovable_cloud"
        | "local_storage"
        | "local_server"
        | "aws_s3"
        | "gcp_storage"
        | "azure_blob"
        | "custom_api"
      task_priority: "critical" | "high" | "medium" | "low" | "none"
      task_status:
        | "backlog"
        | "todo"
        | "in_progress"
        | "in_review"
        | "blocked"
        | "done"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_category: [
        "personal",
        "business",
        "client",
        "vendor",
        "legal",
        "influencer",
        "team",
        "other",
      ],
      document_type: [
        "csv",
        "pdf",
        "docx",
        "doc",
        "txt",
        "xlsx",
        "xls",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "webp",
        "svg",
        "json",
        "md",
        "html",
        "zip",
        "video",
        "audio",
        "other",
      ],
      memory_scope: ["global", "agent", "task", "session", "conversation"],
      memory_type: [
        "fact",
        "preference",
        "context",
        "instruction",
        "learned",
        "summary",
      ],
      storage_provider: [
        "lovable_cloud",
        "local_storage",
        "local_server",
        "aws_s3",
        "gcp_storage",
        "azure_blob",
        "custom_api",
      ],
      task_priority: ["critical", "high", "medium", "low", "none"],
      task_status: [
        "backlog",
        "todo",
        "in_progress",
        "in_review",
        "blocked",
        "done",
        "cancelled",
      ],
    },
  },
} as const
