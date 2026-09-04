import { topics } from './curriculum.ts';

export type TopicStatus = 'not-started' | 'in-progress' | 'needs-review' | 'mastered';
export type Attempt = { at: string; score: number; total: number; missed: string[] };
export type TopicProgress = {
  status: TopicStatus;
  recapReached: boolean;
  practiceComplete: boolean;
  remediated: string[];
  bestScore: number;
  latestScore: number;
  attempts: Attempt[];
  lastStudied?: string;
};
export type ReviewItem = {
  id: string;
  topicId: string;
  questionId: string;
  dueAt: string;
  day: 1 | 3 | 7;
  done: boolean;
};
export type AcademyState = {
  version: 1;
  lang: 'zh' | 'en';
  topicProgress: Record<string, TopicProgress>;
  reviewQueue: ReviewItem[];
  safetyChecks: boolean[];
  notes: Record<string, string>;
  cumulative: { bestScore: number; attempts: Attempt[]; capstoneComplete: boolean };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const validDate = (value: unknown): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value));
const validStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');

export const emptyProgress = (): TopicProgress => ({
  status: 'not-started', recapReached: false, practiceComplete: false,
  remediated: [], bestScore: 0, latestScore: 0, attempts: [],
});

export const initialState = (): AcademyState => ({
  version: 1,
  lang: 'zh',
  topicProgress: Object.fromEntries(topics.map((topic) => [topic.id, emptyProgress()])),
  reviewQueue: [],
  safetyChecks: [false, false, false, false],
  notes: {},
  cumulative: { bestScore: 0, attempts: [], capstoneComplete: false },
});

export const scorePercent = (attempt: Attempt) =>
  attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;

export const deriveStatus = (progress: TopicProgress): TopicStatus => {
  if (progress.status === 'not-started' && progress.attempts.length === 0 && !progress.practiceComplete && !progress.recapReached) return 'not-started';
  const latestAttempt = progress.attempts.at(-1);
  const remediationComplete = Boolean(latestAttempt && latestAttempt.missed.every((id) => progress.remediated.includes(id)));
  if (progress.recapReached && progress.practiceComplete && progress.bestScore >= 80 && remediationComplete) return 'mastered';
  if (progress.attempts.length > 0 && progress.latestScore < 80) return 'needs-review';
  return 'in-progress';
};

export const mergeProgress = (previous: TopicProgress, updates: Partial<TopicProgress>): TopicProgress => {
  const merged: TopicProgress = { ...previous, ...updates };
  return { ...merged, status: deriveStatus(merged) };
};

export const createReviewItems = (topicId: string, attempt: Attempt, now = Date.now()): ReviewItem[] =>
  attempt.missed.flatMap((questionId) => ([1, 3, 7] as const).map((day) => ({
    id: `${attempt.at}-${questionId}-${day}`,
    topicId,
    questionId,
    dueAt: new Date(now + day * 86_400_000).toISOString(),
    day,
    done: false,
  })));

const normalizeAttempt = (value: unknown): Attempt | null => {
  if (!isRecord(value) || !validDate(value.at) || !isFiniteNumber(value.score) || !isFiniteNumber(value.total) || !validStringArray(value.missed)) return null;
  if (value.total <= 0 || value.score < 0 || value.score > value.total) return null;
  return { at: value.at, score: value.score, total: value.total, missed: value.missed };
};

const normalizeTopicProgress = (value: unknown): TopicProgress => {
  const base = emptyProgress();
  if (!isRecord(value)) return base;
  const attempts = Array.isArray(value.attempts) ? value.attempts.map(normalizeAttempt).filter((item): item is Attempt => Boolean(item)) : [];
  const latest = attempts.at(-1);
  const latestScore = latest ? scorePercent(latest) : 0;
  const bestScore = attempts.reduce((best, attempt) => Math.max(best, scorePercent(attempt)), 0);
  const progress: TopicProgress = {
    ...base,
    recapReached: value.recapReached === true,
    practiceComplete: value.practiceComplete === true,
    remediated: validStringArray(value.remediated) ? Array.from(new Set(value.remediated)) : [],
    bestScore,
    latestScore,
    attempts,
    lastStudied: validDate(value.lastStudied) ? value.lastStudied : undefined,
  };
  const importedStatus = value.status;
  progress.status = importedStatus === 'not-started' && attempts.length === 0 && !progress.recapReached && !progress.practiceComplete
    ? 'not-started'
    : deriveStatus({ ...progress, status: 'in-progress' });
  return progress;
};

export const normalizeAcademyState = (value: unknown): AcademyState | null => {
  if (!isRecord(value) || value.version !== 1) return null;
  const base = initialState();
  const rawTopics = isRecord(value.topicProgress) ? value.topicProgress : {};
  const topicProgress = Object.fromEntries(topics.map((topic) => [topic.id, normalizeTopicProgress(rawTopics[topic.id])]));
  const reviewQueue = Array.isArray(value.reviewQueue) ? value.reviewQueue.flatMap((item): ReviewItem[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.topicId !== 'string' || typeof item.questionId !== 'string' || !validDate(item.dueAt)) return [];
    if (![1, 3, 7].includes(Number(item.day)) || !topics.some((topic) => topic.id === item.topicId && topic.quiz.some((question) => question.id === item.questionId))) return [];
    return [{ id: item.id, topicId: item.topicId, questionId: item.questionId, dueAt: item.dueAt, day: item.day as 1 | 3 | 7, done: item.done === true }];
  }) : [];
  const notes = isRecord(value.notes) ? Object.fromEntries(Object.entries(value.notes).filter(([key, note]) => topics.some((topic) => topic.id === key) && typeof note === 'string').map(([key, note]) => [key, String(note).slice(0, 10_000)])) : {};
  const rawCumulative = isRecord(value.cumulative) ? value.cumulative : {};
  const cumulativeAttempts = Array.isArray(rawCumulative.attempts) ? rawCumulative.attempts.map(normalizeAttempt).filter((item): item is Attempt => Boolean(item)) : [];
  const rawSafetyChecks = Array.isArray(value.safetyChecks) ? value.safetyChecks : [];
  return {
    ...base,
    lang: value.lang === 'en' ? 'en' : 'zh',
    topicProgress,
    reviewQueue,
    safetyChecks: base.safetyChecks.map((_, index) => rawSafetyChecks[index] === true),
    notes,
    cumulative: {
      attempts: cumulativeAttempts,
      bestScore: cumulativeAttempts.reduce((best, attempt) => Math.max(best, scorePercent(attempt)), 0),
      capstoneComplete: rawCumulative.capstoneComplete === true,
    },
  };
};
