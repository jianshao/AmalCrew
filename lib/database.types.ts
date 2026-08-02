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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          actor_user_id: string | null
          actor_worker_id: string | null
          created_at: string
          data: Json
          event_type: string
          id: string
          organization_id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          actor_user_id?: string | null
          actor_worker_id?: string | null
          created_at?: string
          data?: Json
          event_type: string
          id?: string
          organization_id: string
          resource_id: string
          resource_type: string
        }
        Update: {
          actor_user_id?: string | null
          actor_worker_id?: string | null
          created_at?: string
          data?: Json
          event_type?: string
          id?: string
          organization_id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_worker_id_fkey"
            columns: ["actor_worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          created_by: string
          expires_at: string
          id: string
          organization_id: string
          token_hash: string
          used_at: string | null
          worker_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          organization_id: string
          token_hash: string
          used_at?: string | null
          worker_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          organization_id?: string
          token_hash?: string
          used_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          organization_id: string
          project_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          organization_id: string
          project_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          organization_id?: string
          project_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_join_requests: {
        Row: {
          created_at: string
          full_name: string
          id: string
          invite_id: string
          organization_id: string
          phone_number: string | null
          preferred_language: string
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["join_request_status"]
          telegram_chat_id: string
          telegram_user_id: string
          telegram_username: string | null
          trade: string | null
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          invite_id: string
          organization_id: string
          phone_number?: string | null
          preferred_language?: string
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          telegram_chat_id: string
          telegram_user_id: string
          telegram_username?: string | null
          trade?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          invite_id?: string
          organization_id?: string
          phone_number?: string | null
          preferred_language?: string
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          telegram_chat_id?: string
          telegram_user_id?: string
          telegram_username?: string | null
          trade?: string | null
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_join_requests_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "project_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_join_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_join_requests_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_sessions: {
        Row: {
          chat_id: string
          created_at: string
          data: Json
          expires_at: string
          invite_id: string | null
          project_id: string | null
          step: string
          telegram_user_id: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string
          data?: Json
          expires_at?: string
          invite_id?: string | null
          project_id?: string | null
          step: string
          telegram_user_id: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string
          data?: Json
          expires_at?: string
          invite_id?: string | null
          project_id?: string | null
          step?: string
          telegram_user_id?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          attempts: number
          created_at: string
          last_error: string | null
          processed_at: string | null
          status: string
          update_id: number
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          last_error?: string | null
          processed_at?: string | null
          status?: string
          update_id: number
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          last_error?: string | null
          processed_at?: string | null
          status?: string
          update_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          attempts: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          id: string
          language: string
          last_error: string | null
          organization_id: string
          payload: Json
          provider_message_id: string | null
          run_after: string
          sent_at: string | null
          status: string
          template_key: string
          updated_at: string
          recipient_external_id: string | null
          worker_id: string | null
        }
        Insert: {
          attempts?: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          language?: string
          last_error?: string | null
          organization_id: string
          payload?: Json
          provider_message_id?: string | null
          run_after?: string
          sent_at?: string | null
          status?: string
          template_key: string
          updated_at?: string
          recipient_external_id?: string | null
          worker_id?: string | null
        }
        Update: {
          attempts?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          language?: string
          last_error?: string | null
          organization_id?: string
          payload?: Json
          provider_message_id?: string | null
          run_after?: string
          sent_at?: string | null
          status?: string
          template_key?: string
          updated_at?: string
          recipient_external_id?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country_code: string
          created_at: string
          default_language: string
          id: string
          name: string
          timezone: string
          updated_at: string
          week_starts_on: number
        }
        Insert: {
          country_code?: string
          created_at?: string
          default_language?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Update: {
          country_code?: string
          created_at?: string
          default_language?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
          week_starts_on?: number
        }
        Relationships: []
      }
      project_workers: {
        Row: {
          assigned_at: string
          organization_id: string
          project_id: string
          worker_id: string
        }
        Insert: {
          assigned_at?: string
          organization_id: string
          project_id: string
          worker_id: string
        }
        Update: {
          assigned_at?: string
          organization_id?: string
          project_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_workers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string
          ends_on: string | null
          id: string
          location: string | null
          name: string
          organization_id: string
          starts_on: string | null
          status: Database["public"]["Enums"]["project_status"]
          supervisor_member_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          ends_on?: string | null
          id?: string
          location?: string | null
          name: string
          organization_id: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          supervisor_member_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          location?: string | null
          name?: string
          organization_id?: string
          starts_on?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          supervisor_member_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_supervisor_member_id_fkey"
            columns: ["supervisor_member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_disputes: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          timesheet_id: string
          timesheet_version: number
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          timesheet_id: string
          timesheet_version: number
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          timesheet_id?: string
          timesheet_version?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_disputes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_disputes_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_disputes_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_revisions: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          organization_id: string
          overtime_minutes: number
          previous_overtime_minutes: number | null
          previous_regular_minutes: number | null
          reason: string | null
          regular_minutes: number
          timesheet_id: string
          version: number
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          organization_id: string
          overtime_minutes: number
          previous_overtime_minutes?: number | null
          previous_regular_minutes?: number | null
          reason?: string | null
          regular_minutes: number
          timesheet_id: string
          version: number
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          overtime_minutes?: number
          previous_overtime_minutes?: number | null
          previous_regular_minutes?: number | null
          reason?: string | null
          regular_minutes?: number
          timesheet_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_revisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_revisions_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved_at: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          organization_id: string
          overtime_minutes: number
          project_id: string
          regular_minutes: number
          status: Database["public"]["Enums"]["timesheet_status"]
          submitted_at: string
          updated_at: string
          version: number
          work_date: string
          worker_id: string
        }
        Insert: {
          approved_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          organization_id: string
          overtime_minutes?: number
          project_id: string
          regular_minutes: number
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string
          updated_at?: string
          version?: number
          work_date: string
          worker_id: string
        }
        Update: {
          approved_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          overtime_minutes?: number
          project_id?: string
          regular_minutes?: number
          status?: Database["public"]["Enums"]["timesheet_status"]
          submitted_at?: string
          updated_at?: string
          version?: number
          work_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_channel_identities: {
        Row: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          external_user_id: string | null
          external_chat_id: string | null
          id: string
          is_enabled: boolean
          is_preferred: boolean
          is_verified: boolean
          opted_in_at: string | null
          organization_id: string
          phone_number: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          external_user_id?: string | null
          external_chat_id?: string | null
          id?: string
          is_enabled?: boolean
          is_preferred?: boolean
          is_verified?: boolean
          opted_in_at?: string | null
          organization_id: string
          phone_number?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          external_user_id?: string | null
          external_chat_id?: string | null
          id?: string
          is_enabled?: boolean
          is_preferred?: boolean
          is_verified?: boolean
          opted_in_at?: string | null
          organization_id?: string
          phone_number?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_channel_identities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_channel_identities_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string
          full_name: string
          id: string
          organization_id: string
          phone_number: string | null
          preferred_language: string
          status: Database["public"]["Enums"]["worker_status"]
          trade: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          organization_id: string
          phone_number?: string | null
          preferred_language?: string
          status?: Database["public"]["Enums"]["worker_status"]
          trade?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          organization_id?: string
          phone_number?: string | null
          preferred_language?: string
          status?: Database["public"]["Enums"]["worker_status"]
          trade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_project_join_request: {
        Args: { target_request_id: string }
        Returns: Database["public"]["Tables"]["project_join_requests"]["Row"]
      }
      approve_timesheet: {
        Args: {
          change_reason?: string
          expected_version: number
          new_overtime_minutes?: number
          new_regular_minutes?: number
          target_timesheet_id: string
        }
        Returns: {
          approved_at: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          organization_id: string
          overtime_minutes: number
          project_id: string
          regular_minutes: number
          status: Database["public"]["Enums"]["timesheet_status"]
          submitted_at: string
          updated_at: string
          version: number
          work_date: string
          worker_id: string
        }
        SetofOptions: {
          from: "*"
          to: "timesheets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_admin_organization: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      can_manage_organization: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      create_organization: {
        Args: {
          organization_country_code?: string
          organization_name: string
          organization_timezone?: string
        }
        Returns: {
          country_code: string
          created_at: string
          default_language: string
          id: string
          name: string
          timezone: string
          updated_at: string
          week_starts_on: number
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_project_join_request: {
        Args: { target_request_id: string }
        Returns: Database["public"]["Tables"]["project_join_requests"]["Row"]
      }
      reject_timesheet: {
        Args: { expected_version: number; target_timesheet_id: string }
        Returns: Database["public"]["Tables"]["timesheets"]["Row"]
      }
      is_organization_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
    }
    Enums: {
      channel_type: "WHATSAPP" | "TELEGRAM"
      join_request_status: "PENDING" | "APPROVED" | "REJECTED"
      organization_role: "OWNER" | "ADMIN" | "SUPERVISOR"
      project_status: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED"
      timesheet_status:
        | "SUBMITTED"
        | "APPROVED"
        | "WORKER_CONFIRMATION_REQUIRED"
        | "CONFIRMED"
        | "REJECTED"
        | "DISPUTED"
        | "LOCKED"
      worker_status: "ACTIVE" | "INACTIVE"
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
      channel_type: ["WHATSAPP", "TELEGRAM"],
      organization_role: ["OWNER", "ADMIN", "SUPERVISOR"],
      project_status: ["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"],
      timesheet_status: [
        "SUBMITTED",
        "APPROVED",
        "WORKER_CONFIRMATION_REQUIRED",
        "CONFIRMED",
        "REJECTED",
        "DISPUTED",
        "LOCKED",
      ],
      worker_status: ["ACTIVE", "INACTIVE"],
    },
  },
} as const
