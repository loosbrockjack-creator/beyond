// Generated from the live schema via the Supabase MCP `generate_typescript_types`.
// Regenerate after any migration rather than hand-editing.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      course: {
        Row: { created_at: string; seeded: boolean; start_date: string; user_id: string };
        Insert: { created_at?: string; seeded?: boolean; start_date: string; user_id: string };
        Update: { created_at?: string; seeded?: boolean; start_date?: string; user_id?: string };
        Relationships: [];
      };
      modules: {
        Row: { created_at: string; id: string; number: number; slug: string; subtitle: string | null; summary: string | null; title: string };
        Insert: { created_at?: string; id?: string; number: number; slug: string; subtitle?: string | null; summary?: string | null; title: string };
        Update: { created_at?: string; id?: string; number?: number; slug?: string; subtitle?: string | null; summary?: string | null; title?: string };
        Relationships: [];
      };
      topics: {
        Row: { created_at: string; id: string; module_id: string; number: number; slug: string; summary: string | null; title: string; week_number: number; why_it_matters: string | null };
        Insert: { created_at?: string; id?: string; module_id: string; number: number; slug: string; summary?: string | null; title: string; week_number: number; why_it_matters?: string | null };
        Update: { created_at?: string; id?: string; module_id?: string; number?: number; slug?: string; summary?: string | null; title?: string; week_number?: number; why_it_matters?: string | null };
        Relationships: [{ foreignKeyName: "topics_module_id_fkey"; columns: ["module_id"]; isOneToOne: false; referencedRelation: "modules"; referencedColumns: ["id"] }];
      };
      sessions: {
        Row: { created_at: string; est_minutes: number | null; id: string; note: string | null; order_index: number; source_kind: string; source_url: string | null; title: string; topic_id: string };
        Insert: { created_at?: string; est_minutes?: number | null; id?: string; note?: string | null; order_index: number; source_kind?: string; source_url?: string | null; title: string; topic_id: string };
        Update: { created_at?: string; est_minutes?: number | null; id?: string; note?: string | null; order_index?: number; source_kind?: string; source_url?: string | null; title?: string; topic_id?: string };
        Relationships: [{ foreignKeyName: "sessions_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: false; referencedRelation: "topics"; referencedColumns: ["id"] }];
      };
      recall_questions: {
        Row: { carried_from_session_id: string | null; explanation: string | null; id: string; order_index: number; prompt: string; session_id: string };
        Insert: { carried_from_session_id?: string | null; explanation?: string | null; id?: string; order_index: number; prompt: string; session_id: string };
        Update: { carried_from_session_id?: string | null; explanation?: string | null; id?: string; order_index?: number; prompt?: string; session_id?: string };
        Relationships: [{ foreignKeyName: "recall_questions_session_id_fkey"; columns: ["session_id"]; isOneToOne: false; referencedRelation: "sessions"; referencedColumns: ["id"] }];
      };
      recall_options: {
        Row: { id: string; is_correct: boolean; label: string; order_index: number; question_id: string };
        Insert: { id?: string; is_correct?: boolean; label: string; order_index: number; question_id: string };
        Update: { id?: string; is_correct?: boolean; label?: string; order_index?: number; question_id?: string };
        Relationships: [{ foreignKeyName: "recall_options_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "recall_questions"; referencedColumns: ["id"] }];
      };
      session_progress: {
        Row: { answers: Json; completed_at: string | null; correct_count: number | null; opened_at: string | null; score: number | null; session_id: string; total_count: number | null; user_id: string };
        Insert: { answers?: Json; completed_at?: string | null; correct_count?: number | null; opened_at?: string | null; score?: number | null; session_id: string; total_count?: number | null; user_id: string };
        Update: { answers?: Json; completed_at?: string | null; correct_count?: number | null; opened_at?: string | null; score?: number | null; session_id?: string; total_count?: number | null; user_id?: string };
        Relationships: [{ foreignKeyName: "session_progress_session_id_fkey"; columns: ["session_id"]; isOneToOne: false; referencedRelation: "sessions"; referencedColumns: ["id"] }];
      };
      quizzes: {
        Row: { id: string; pass_threshold: number; title: string; topic_id: string };
        Insert: { id?: string; pass_threshold?: number; title: string; topic_id: string };
        Update: { id?: string; pass_threshold?: number; title?: string; topic_id?: string };
        Relationships: [{ foreignKeyName: "quizzes_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: true; referencedRelation: "topics"; referencedColumns: ["id"] }];
      };
      quiz_questions: {
        Row: { explanation: string | null; id: string; is_placeholder: boolean; order_index: number; prompt: string; quiz_id: string; session_id: string | null };
        Insert: { explanation?: string | null; id?: string; is_placeholder?: boolean; order_index: number; prompt: string; quiz_id: string; session_id?: string | null };
        Update: { explanation?: string | null; id?: string; is_placeholder?: boolean; order_index?: number; prompt?: string; quiz_id?: string; session_id?: string | null };
        Relationships: [{ foreignKeyName: "quiz_questions_quiz_id_fkey"; columns: ["quiz_id"]; isOneToOne: false; referencedRelation: "quizzes"; referencedColumns: ["id"] }];
      };
      quiz_options: {
        Row: { id: string; is_correct: boolean; label: string; order_index: number; question_id: string };
        Insert: { id?: string; is_correct?: boolean; label: string; order_index: number; question_id: string };
        Update: { id?: string; is_correct?: boolean; label?: string; order_index?: number; question_id?: string };
        Relationships: [{ foreignKeyName: "quiz_options_question_id_fkey"; columns: ["question_id"]; isOneToOne: false; referencedRelation: "quiz_questions"; referencedColumns: ["id"] }];
      };
      quiz_attempts: {
        Row: { answers: Json; attempt_number: number; created_at: string; id: string; passed: boolean; quiz_id: string; score: number; user_id: string };
        Insert: { answers?: Json; attempt_number: number; created_at?: string; id?: string; passed: boolean; quiz_id: string; score: number; user_id: string };
        Update: { answers?: Json; attempt_number?: number; created_at?: string; id?: string; passed?: boolean; quiz_id?: string; score?: number; user_id?: string };
        Relationships: [{ foreignKeyName: "quiz_attempts_quiz_id_fkey"; columns: ["quiz_id"]; isOneToOne: false; referencedRelation: "quizzes"; referencedColumns: ["id"] }];
      };
      projects: {
        Row: { brief: string | null; id: string; is_placeholder: boolean; title: string; topic_id: string };
        Insert: { brief?: string | null; id?: string; is_placeholder?: boolean; title: string; topic_id: string };
        Update: { brief?: string | null; id?: string; is_placeholder?: boolean; title?: string; topic_id?: string };
        Relationships: [{ foreignKeyName: "projects_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: true; referencedRelation: "topics"; referencedColumns: ["id"] }];
      };
      rubric_criteria: {
        Row: { description: string | null; id: string; label: string; max_points: number; order_index: number; project_id: string };
        Insert: { description?: string | null; id?: string; label: string; max_points?: number; order_index: number; project_id: string };
        Update: { description?: string | null; id?: string; label?: string; max_points?: number; order_index?: number; project_id?: string };
        Relationships: [{ foreignKeyName: "rubric_criteria_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      submissions: {
        Row: { feedback: string | null; graded_at: string | null; id: string; notes: string | null; project_id: string; repo_url: string | null; status: string; submitted_at: string; total_score: number | null; user_id: string };
        Insert: { feedback?: string | null; graded_at?: string | null; id?: string; notes?: string | null; project_id: string; repo_url?: string | null; status?: string; submitted_at?: string; total_score?: number | null; user_id: string };
        Update: { feedback?: string | null; graded_at?: string | null; id?: string; notes?: string | null; project_id?: string; repo_url?: string | null; status?: string; submitted_at?: string; total_score?: number | null; user_id?: string };
        Relationships: [{ foreignKeyName: "submissions_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      rubric_scores: {
        Row: { comment: string | null; criterion_id: string; id: string; points: number; submission_id: string };
        Insert: { comment?: string | null; criterion_id: string; id?: string; points: number; submission_id: string };
        Update: { comment?: string | null; criterion_id?: string; id?: string; points?: number; submission_id?: string };
        Relationships: [
          { foreignKeyName: "rubric_scores_criterion_id_fkey"; columns: ["criterion_id"]; isOneToOne: false; referencedRelation: "rubric_criteria"; referencedColumns: ["id"] },
          { foreignKeyName: "rubric_scores_submission_id_fkey"; columns: ["submission_id"]; isOneToOne: false; referencedRelation: "submissions"; referencedColumns: ["id"] },
        ];
      };
      topic_progress: {
        Row: { completed_at: string | null; status: string; topic_id: string; unlocked_at: string | null; user_id: string };
        Insert: { completed_at?: string | null; status?: string; topic_id: string; unlocked_at?: string | null; user_id: string };
        Update: { completed_at?: string | null; status?: string; topic_id?: string; unlocked_at?: string | null; user_id?: string };
        Relationships: [{ foreignKeyName: "topic_progress_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: false; referencedRelation: "topics"; referencedColumns: ["id"] }];
      };
      resources: {
        Row: { consumed_at: string | null; created_at: string; id: string; kind: string; note: string | null; title: string; topic_id: string | null; url: string; user_id: string };
        Insert: { consumed_at?: string | null; created_at?: string; id?: string; kind?: string; note?: string | null; title: string; topic_id?: string | null; url: string; user_id: string };
        Update: { consumed_at?: string | null; created_at?: string; id?: string; kind?: string; note?: string | null; title?: string; topic_id?: string | null; url?: string; user_id?: string };
        Relationships: [{ foreignKeyName: "resources_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: false; referencedRelation: "topics"; referencedColumns: ["id"] }];
      };
      tools: {
        Row: { category: string; description: string | null; id: string; kind: string; name: string; order_index: number; url: string };
        Insert: { category: string; description?: string | null; id?: string; kind?: string; name: string; order_index?: number; url: string };
        Update: { category?: string; description?: string | null; id?: string; kind?: string; name?: string; order_index?: number; url?: string };
        Relationships: [];
      };
      tool_topics: {
        Row: { tool_id: string; topic_id: string };
        Insert: { tool_id: string; topic_id: string };
        Update: { tool_id?: string; topic_id?: string };
        Relationships: [
          { foreignKeyName: "tool_topics_tool_id_fkey"; columns: ["tool_id"]; isOneToOne: false; referencedRelation: "tools"; referencedColumns: ["id"] },
          { foreignKeyName: "tool_topics_topic_id_fkey"; columns: ["topic_id"]; isOneToOne: false; referencedRelation: "topics"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];

export type Module = Tables<"modules">;
export type Topic = Tables<"topics">;
export type Quiz = Tables<"quizzes">;
export type QuizQuestion = Tables<"quiz_questions">;
export type QuizOption = Tables<"quiz_options">;
export type QuizAttempt = Tables<"quiz_attempts">;
export type Project = Tables<"projects">;
export type RubricCriterion = Tables<"rubric_criteria">;
export type Submission = Tables<"submissions">;
export type RubricScore = Tables<"rubric_scores">;
export type Resource = Tables<"resources">;
export type Tool = Tables<"tools">;
export type Course = Tables<"course">;
export type LearningSession = Tables<"sessions">;
export type RecallQuestion = Tables<"recall_questions">;
export type RecallOption = Tables<"recall_options">;
export type SessionProgress = Tables<"session_progress">;
