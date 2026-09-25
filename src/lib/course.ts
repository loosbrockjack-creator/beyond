import { createClient } from "@/lib/supabase/server";
import { deriveTopicStatuses, activeTopic, type TopicStatus } from "@/lib/gating";
import { gpaOf, gradeFor, type Grade } from "@/lib/gpa";
import { projectDue, quizDue, currentWeek, isOverdue, wasLate, WEEKS_TOTAL } from "@/lib/schedule";
import type {
  Module, Topic, Quiz, Project, QuizAttempt, Submission,
  LearningSession, SessionProgress,
} from "@/lib/supabase/types";

export interface SessionView {
  session: LearningSession;
  progress: SessionProgress | null;
  /** Sessions are never locked and never late. They are done or not. */
  done: boolean;
}

export interface TopicView {
  topic: Topic;
  status: TopicStatus;
  quiz: Quiz | null;
  project: Project | null;
  attempts: QuizAttempt[];
  submission: Submission | null;
  due: Date;
  overdue: boolean;
  late: boolean;
  grade: Grade | null;
  moduleSlug: string;

  sessions: SessionView[];
  sessionsDone: number;
  /** The weekly quiz draws on every session, so it waits for all of them. */
  quizReady: boolean;
  quizDue: Date;
  quizOverdue: boolean;
}

export interface ModuleView {
  module: Module;
  topics: TopicView[];
  completeCount: number;
  locked: boolean;
  gpa: number | null;
}

export interface CourseView {
  startDate: string;
  seeded: boolean;
  week: number;
  modules: ModuleView[];
  topics: TopicView[];
  gpa: number | null;
  completeCount: number;
  active: TopicView | null;
  email: string;
}

/** The Monday on or after `from`. Used when a user has no course row yet. */
function upcomingMonday(from = new Date()): string {
  const d = new Date(from);
  const shift = (8 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + shift);
  return d.toISOString().slice(0, 10);
}

export async function loadCourse(): Promise<CourseView> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("loadCourse called without a session");

  const [
    courseRes, modulesRes, topicsRes, quizzesRes, projectsRes,
    attemptsRes, submissionsRes, sessionsRes, sessionProgressRes,
  ] = await Promise.all([
    supabase.from("course").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("modules").select("*").order("number"),
    supabase.from("topics").select("*").order("number"),
    supabase.from("quizzes").select("*"),
    supabase.from("projects").select("*"),
    supabase.from("quiz_attempts").select("*").order("attempt_number"),
    supabase.from("submissions").select("*"),
    supabase.from("sessions").select("*").order("order_index"),
    supabase.from("session_progress").select("*"),
  ]);

  const modules = modulesRes.data ?? [];
  const topics = topicsRes.data ?? [];
  const quizzes = quizzesRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const sessionProgress = sessionProgressRes.data ?? [];

  const startDate = courseRes.data?.start_date ?? upcomingMonday();
  const seeded = courseRes.data?.seeded ?? false;

  const quizByTopic = new Map(quizzes.map((q) => [q.topic_id, q]));
  const projectByTopic = new Map(projects.map((p) => [p.topic_id, p]));
  const submissionByProject = new Map(submissions.map((s) => [s.project_id, s]));

  const progressBySession = new Map(sessionProgress.map((sp) => [sp.session_id, sp]));
  const sessionsByTopic = new Map<string, LearningSession[]>();
  for (const sn of sessions) {
    const list = sessionsByTopic.get(sn.topic_id) ?? [];
    list.push(sn);
    sessionsByTopic.set(sn.topic_id, list);
  }

  const attemptsByQuiz = new Map<string, QuizAttempt[]>();
  for (const a of attempts) {
    const list = attemptsByQuiz.get(a.quiz_id) ?? [];
    list.push(a);
    attemptsByQuiz.set(a.quiz_id, list);
  }

  // A topic is passed when its quiz has a passing attempt, started when it has any.
  const passedIds = new Set<string>();
  const startedIds = new Set<string>();
  for (const t of topics) {
    const quiz = quizByTopic.get(t.id);
    if (!quiz) continue;
    const list = attemptsByQuiz.get(quiz.id) ?? [];
    if (list.length > 0) startedIds.add(t.id);
    if (list.some((a) => a.passed)) passedIds.add(t.id);
  }

  const statuses = deriveTopicStatuses(topics, passedIds, startedIds);
  const moduleSlugById = new Map(modules.map((m) => [m.id, m.slug]));

  const topicViews: TopicView[] = topics.map((topic) => {
    const quiz = quizByTopic.get(topic.id) ?? null;
    const project = projectByTopic.get(topic.id) ?? null;
    const submission = project ? submissionByProject.get(project.id) ?? null : null;
    const due = projectDue(startDate, topic.week_number);
    const qDue = quizDue(startDate, topic.week_number);

    const topicSessions: SessionView[] = (sessionsByTopic.get(topic.id) ?? []).map((sn) => {
      const sp = progressBySession.get(sn.id) ?? null;
      return { session: sn, progress: sp, done: sp?.completed_at != null };
    });
    const sessionsDone = topicSessions.filter((sv) => sv.done).length;
    const quizPassed = passedIds.has(topic.id);

    return {
      sessions: topicSessions,
      sessionsDone,
      // With no sessions written yet the quiz is not held back by them.
      quizReady: topicSessions.length === 0 || sessionsDone === topicSessions.length,
      quizDue: qDue,
      quizOverdue: !quizPassed && new Date() > qDue,
      topic,
      status: statuses.get(topic.id) ?? "locked",
      quiz,
      project,
      attempts: quiz ? attemptsByQuiz.get(quiz.id) ?? [] : [],
      submission,
      due,
      overdue: isOverdue(due, submission?.submitted_at ?? null),
      late: wasLate(due, submission?.submitted_at ?? null),
      grade: submission?.total_score != null ? gradeFor(submission.total_score) : null,
      moduleSlug: moduleSlugById.get(topic.module_id) ?? "",
    };
  });

  const byId = new Map(topicViews.map((tv) => [tv.topic.id, tv]));

  const moduleViews: ModuleView[] = modules.map((module) => {
    const mTopics = topicViews.filter((tv) => tv.topic.module_id === module.id);
    const scores = mTopics
      .map((tv) => tv.submission?.total_score)
      .filter((s): s is number => s != null);

    return {
      module,
      topics: mTopics,
      completeCount: mTopics.filter((tv) => tv.status === "complete").length,
      locked: mTopics.every((tv) => tv.status === "locked"),
      gpa: gpaOf(scores),
    };
  });

  const allScores = topicViews
    .map((tv) => tv.submission?.total_score)
    .filter((s): s is number => s != null);

  const activeRef = activeTopic(topics, statuses);

  return {
    startDate,
    seeded,
    week: Math.min(currentWeek(startDate), WEEKS_TOTAL),
    modules: moduleViews,
    topics: topicViews,
    gpa: gpaOf(allScores),
    completeCount: topicViews.filter((tv) => tv.status === "complete").length,
    active: activeRef ? byId.get(activeRef.id) ?? null : null,
    email: user.email ?? "",
  };
}

export function findModule(course: CourseView, slug: string): ModuleView | undefined {
  return course.modules.find((m) => m.module.slug === slug);
}

export function findTopic(course: CourseView, slug: string): TopicView | undefined {
  return course.topics.find((t) => t.topic.slug === slug);
}
