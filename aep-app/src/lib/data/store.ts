'use client';

import type {
  User, Team, CompetencyDomain, CompetencySubdomain, Skill,
  Question, Assessment, AssessmentQuestion, AssessmentSession,
  SessionResponse, Score, ProficiencyRating,
  UserRole, QuestionStatus, DifficultyLevel, PracticeArea, ProficiencyLevel,
} from '@/lib/types';

import {
  mockUsers, mockTeams, mockDomains, mockSubdomains, mockSkills,
  mockQuestions, mockAssessments, mockAssessmentQuestions, mockSessions,
  mockResponses, mockScores, mockProficiencyRatings,
} from './mock-data';

// ============ Internal Types ============

interface StoreData {
  users: User[];
  teams: Team[];
  domains: CompetencyDomain[];
  subdomains: CompetencySubdomain[];
  skills: Skill[];
  questions: Question[];
  assessments: Assessment[];
  assessmentQuestions: AssessmentQuestion[];
  sessions: AssessmentSession[];
  responses: SessionResponse[];
  scores: Score[];
  proficiencyRatings: ProficiencyRating[];
  currentUserId: string | null;
}

// ============ Helpers ============

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function now(): string {
  return new Date().toISOString();
}

// ============ Persistence ============

const STORAGE_KEY = 'aep-store';

function initFromMockData(): StoreData {
  return {
    users: clone(mockUsers),
    teams: clone(mockTeams),
    domains: clone(mockDomains),
    subdomains: clone(mockSubdomains),
    skills: clone(mockSkills),
    questions: clone(mockQuestions),
    assessments: clone(mockAssessments),
    assessmentQuestions: clone(mockAssessmentQuestions),
    sessions: clone(mockSessions),
    responses: clone(mockResponses),
    scores: clone(mockScores),
    proficiencyRatings: clone(mockProficiencyRatings),
    currentUserId: null,
  };
}

function loadFromStorage(): StoreData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoreData;
  } catch {
    return null;
  }
}

function persist(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }
}

let data: StoreData = loadFromStorage() || initFromMockData();

/** Reset all data back to mock defaults and clear localStorage. */
export function resetStore(): void {
  data = initFromMockData();
  persist();
}

// ============ Auth Store ============

export function getCurrentUser(): User | null {
  if (!data.currentUserId) return null;
  const user = data.users.find((u) => u.id === data.currentUserId) ?? null;
  return user ? clone(user) : null;
}

export function login(email: string): User | null {
  const user = data.users.find((u) => u.email === email && u.isActive);
  if (!user) return null;
  data.currentUserId = user.id;
  persist();
  return clone(user);
}

export function loginById(userId: string): User | null {
  const user = data.users.find((u) => u.id === userId && u.isActive);
  if (!user) return null;
  data.currentUserId = user.id;
  persist();
  return clone(user);
}

export function logout(): void {
  data.currentUserId = null;
  persist();
}

export function switchRole(role: UserRole): User | null {
  // Switch to a real user with that role for realistic demo experience
  const userWithRole = data.users.find((u) => u.role === role && u.isActive);
  if (userWithRole) {
    data.currentUserId = userWithRole.id;
    persist();
    return clone(userWithRole);
  }
  // Fallback: change current user's role
  if (!data.currentUserId) return null;
  const idx = data.users.findIndex((u) => u.id === data.currentUserId);
  if (idx === -1) return null;
  data.users[idx] = { ...data.users[idx], role };
  persist();
  return clone(data.users[idx]);
}

// ============ Users ============

export function getUsers(): User[] {
  return clone(data.users);
}

export function getUserById(id: string): User | null {
  const user = data.users.find((u) => u.id === id) ?? null;
  return user ? clone(user) : null;
}

export function createUser(input: Omit<User, 'id' | 'createdAt'>): User {
  const user: User = {
    ...input,
    id: generateId(),
    createdAt: now(),
  };
  data.users.push(user);
  persist();
  return clone(user);
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const idx = data.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  data.users[idx] = { ...data.users[idx], ...updates };
  persist();
  return clone(data.users[idx]);
}

// ============ Teams ============

export function getTeams(): Team[] {
  return clone(data.teams);
}

export function getTeamById(id: string): Team | null {
  const team = data.teams.find((t) => t.id === id) ?? null;
  return team ? clone(team) : null;
}

// ============ Competencies ============

export function getDomains(): CompetencyDomain[] {
  return clone(data.domains.sort((a, b) => a.sortOrder - b.sortOrder));
}

export function getDomainById(id: string): CompetencyDomain | null {
  const domain = data.domains.find((d) => d.id === id) ?? null;
  return domain ? clone(domain) : null;
}

export function getDomainsByPracticeArea(practiceArea: PracticeArea): CompetencyDomain[] {
  return clone(
    data.domains
      .filter((d) => d.practiceArea === practiceArea)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function createDomain(input: Omit<CompetencyDomain, 'id'>): CompetencyDomain {
  const domain: CompetencyDomain = { ...input, id: generateId() };
  data.domains.push(domain);
  persist();
  return clone(domain);
}

export function updateDomain(id: string, updates: Partial<Omit<CompetencyDomain, 'id'>>): CompetencyDomain | null {
  const idx = data.domains.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  data.domains[idx] = { ...data.domains[idx], ...updates };
  persist();
  return clone(data.domains[idx]);
}

export function deleteDomain(id: string): boolean {
  const idx = data.domains.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  data.domains.splice(idx, 1);
  // Cascade: remove subdomains and their skills
  const subdomainIds = data.subdomains.filter((s) => s.domainId === id).map((s) => s.id);
  data.subdomains = data.subdomains.filter((s) => s.domainId !== id);
  data.skills = data.skills.filter((s) => !subdomainIds.includes(s.subdomainId));
  persist();
  return true;
}

export function getSubdomains(domainId: string): CompetencySubdomain[] {
  return clone(
    data.subdomains
      .filter((s) => s.domainId === domainId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function getSubdomainById(id: string): CompetencySubdomain | null {
  const sub = data.subdomains.find((s) => s.id === id) ?? null;
  return sub ? clone(sub) : null;
}

export function createSubdomain(input: Omit<CompetencySubdomain, 'id'>): CompetencySubdomain {
  const sub: CompetencySubdomain = { ...input, id: generateId() };
  data.subdomains.push(sub);
  persist();
  return clone(sub);
}

export function updateSubdomain(id: string, updates: Partial<Omit<CompetencySubdomain, 'id'>>): CompetencySubdomain | null {
  const idx = data.subdomains.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  data.subdomains[idx] = { ...data.subdomains[idx], ...updates };
  persist();
  return clone(data.subdomains[idx]);
}

export function deleteSubdomain(id: string): boolean {
  const idx = data.subdomains.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  data.subdomains.splice(idx, 1);
  data.skills = data.skills.filter((s) => s.subdomainId !== id);
  persist();
  return true;
}

export function getSkills(subdomainId: string): Skill[] {
  return clone(
    data.skills
      .filter((s) => s.subdomainId === subdomainId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function getAllSkills(): Skill[] {
  return clone(data.skills);
}

export function getSkillById(id: string): Skill | null {
  const skill = data.skills.find((s) => s.id === id) ?? null;
  return skill ? clone(skill) : null;
}

export function createSkill(input: Omit<Skill, 'id'>): Skill {
  const skill: Skill = { ...input, id: generateId() };
  data.skills.push(skill);
  persist();
  return clone(skill);
}

export function updateSkill(id: string, updates: Partial<Omit<Skill, 'id'>>): Skill | null {
  const idx = data.skills.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  data.skills[idx] = { ...data.skills[idx], ...updates };
  persist();
  return clone(data.skills[idx]);
}

export function deleteSkill(id: string): boolean {
  const idx = data.skills.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  data.skills.splice(idx, 1);
  persist();
  return true;
}

// ============ Questions ============

export interface QuestionFilters {
  status?: QuestionStatus;
  difficulty?: DifficultyLevel;
  skillId?: string;
  search?: string;
  questionType?: 'mcq' | 'multi_select';
}

export function getQuestions(filters?: QuestionFilters): Question[] {
  let results = data.questions;

  if (filters) {
    if (filters.status) {
      results = results.filter((q) => q.status === filters.status);
    }
    if (filters.difficulty) {
      results = results.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters.skillId) {
      results = results.filter((q) => q.skillId === filters.skillId);
    }
    if (filters.questionType) {
      results = results.filter((q) => q.questionType === filters.questionType);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (q) =>
          q.title.toLowerCase().includes(term) ||
          q.body.toLowerCase().includes(term)
      );
    }
  }

  return clone(results);
}

export function getQuestionById(id: string): Question | null {
  const question = data.questions.find((q) => q.id === id) ?? null;
  return question ? clone(question) : null;
}

export function createQuestion(input: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Question {
  const question: Question = {
    ...input,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  data.questions.push(question);
  persist();
  return clone(question);
}

export function updateQuestion(id: string, updates: Partial<Omit<Question, 'id' | 'createdAt'>>): Question | null {
  const idx = data.questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  data.questions[idx] = { ...data.questions[idx], ...updates, updatedAt: now() };
  persist();
  return clone(data.questions[idx]);
}

export function updateQuestionStatus(id: string, status: QuestionStatus, reviewedBy?: string, reviewNotes?: string): Question | null {
  const idx = data.questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  data.questions[idx] = {
    ...data.questions[idx],
    status,
    reviewedBy: reviewedBy ?? data.questions[idx].reviewedBy,
    reviewNotes: reviewNotes ?? data.questions[idx].reviewNotes,
    updatedAt: now(),
  };
  persist();
  return clone(data.questions[idx]);
}

export function deleteQuestion(id: string): boolean {
  const idx = data.questions.findIndex((q) => q.id === id);
  if (idx === -1) return false;
  data.questions.splice(idx, 1);
  // Also remove from any assessments
  data.assessmentQuestions = data.assessmentQuestions.filter((aq) => aq.questionId !== id);
  persist();
  return true;
}

// ============ Assessments ============

export function getAssessments(): Assessment[] {
  return clone(data.assessments);
}

export function getAssessmentById(id: string): Assessment | null {
  const assessment = data.assessments.find((a) => a.id === id) ?? null;
  return assessment ? clone(assessment) : null;
}

export function createAssessment(input: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Assessment {
  const assessment: Assessment = {
    ...input,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  data.assessments.push(assessment);
  persist();
  return clone(assessment);
}

export function updateAssessment(id: string, updates: Partial<Omit<Assessment, 'id' | 'createdAt'>>): Assessment | null {
  const idx = data.assessments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  data.assessments[idx] = { ...data.assessments[idx], ...updates, updatedAt: now() };
  persist();
  return clone(data.assessments[idx]);
}

export function deleteAssessment(id: string): boolean {
  const idx = data.assessments.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  data.assessments.splice(idx, 1);
  data.assessmentQuestions = data.assessmentQuestions.filter((aq) => aq.assessmentId !== id);
  persist();
  return true;
}

export function getAssessmentQuestions(assessmentId: string): AssessmentQuestion[] {
  return clone(
    data.assessmentQuestions
      .filter((aq) => aq.assessmentId === assessmentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
}

export function addQuestionToAssessment(
  assessmentId: string,
  questionId: string,
  weight: number = 1,
  sortOrder?: number
): AssessmentQuestion {
  const existing = data.assessmentQuestions.filter((aq) => aq.assessmentId === assessmentId);
  const aq: AssessmentQuestion = {
    id: generateId(),
    assessmentId,
    questionId,
    sortOrder: sortOrder ?? existing.length + 1,
    weight,
  };
  data.assessmentQuestions.push(aq);
  persist();
  return clone(aq);
}

export function removeQuestionFromAssessment(assessmentId: string, questionId: string): boolean {
  const idx = data.assessmentQuestions.findIndex(
    (aq) => aq.assessmentId === assessmentId && aq.questionId === questionId
  );
  if (idx === -1) return false;
  data.assessmentQuestions.splice(idx, 1);
  persist();
  return true;
}

export function updateAssessmentQuestion(
  id: string,
  updates: Partial<Omit<AssessmentQuestion, 'id'>>
): AssessmentQuestion | null {
  const idx = data.assessmentQuestions.findIndex((aq) => aq.id === id);
  if (idx === -1) return null;
  data.assessmentQuestions[idx] = { ...data.assessmentQuestions[idx], ...updates };
  persist();
  return clone(data.assessmentQuestions[idx]);
}

// ============ Sessions ============

export function getSessionByUserAndAssessment(userId: string, assessmentId: string): AssessmentSession | null {
  const session = data.sessions.find(
    (s) => s.userId === userId && s.assessmentId === assessmentId
  ) ?? null;
  return session ? clone(session) : null;
}

export function getSessionById(id: string): AssessmentSession | null {
  const session = data.sessions.find((s) => s.id === id) ?? null;
  return session ? clone(session) : null;
}

export function getSessions(): AssessmentSession[] {
  return clone(data.sessions);
}

export function getSessionsByAssessment(assessmentId: string): AssessmentSession[] {
  return clone(data.sessions.filter((s) => s.assessmentId === assessmentId));
}

export function getSessionsByUser(userId: string): AssessmentSession[] {
  return clone(data.sessions.filter((s) => s.userId === userId));
}

export function createSession(input: Omit<AssessmentSession, 'id' | 'createdAt'>): AssessmentSession {
  const session: AssessmentSession = {
    ...input,
    id: generateId(),
    createdAt: now(),
  };
  data.sessions.push(session);
  persist();
  return clone(session);
}

export function updateSession(id: string, updates: Partial<Omit<AssessmentSession, 'id' | 'createdAt'>>): AssessmentSession | null {
  const idx = data.sessions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  data.sessions[idx] = { ...data.sessions[idx], ...updates };
  persist();
  return clone(data.sessions[idx]);
}

// ============ Responses ============

export function getSessionResponses(sessionId: string): SessionResponse[] {
  return clone(data.responses.filter((r) => r.sessionId === sessionId));
}

export function saveResponse(input: Omit<SessionResponse, 'id'>): SessionResponse {
  // Upsert by sessionId + questionId
  const idx = data.responses.findIndex(
    (r) => r.sessionId === input.sessionId && r.questionId === input.questionId
  );

  if (idx !== -1) {
    data.responses[idx] = { ...data.responses[idx], ...input };
    persist();
    return clone(data.responses[idx]);
  }

  const response: SessionResponse = {
    ...input,
    id: generateId(),
  };
  data.responses.push(response);
  persist();
  return clone(response);
}

// ============ Scoring ============

function toProficiencyLevel(percentage: number): ProficiencyLevel {
  if (percentage <= 25) return 'foundational';
  if (percentage <= 50) return 'developing';
  if (percentage <= 75) return 'proficient';
  return 'expert';
}

/**
 * Score a submitted session. Calculates points per response, creates a Score record,
 * and generates per-skill ProficiencyRating records.
 */
export function scoreSession(sessionId: string): Score | null {
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const responses = data.responses.filter((r) => r.sessionId === sessionId);
  const aqList = data.assessmentQuestions.filter((aq) => aq.assessmentId === session.assessmentId);

  let totalPoints = 0;
  let maxPoints = 0;

  // Map of skillId -> { earned, max }
  const skillMap = new Map<string, { earned: number; max: number }>();

  for (const aq of aqList) {
    const question = data.questions.find((q) => q.id === aq.questionId);
    if (!question) continue;

    const weightedMax = question.points * aq.weight;
    maxPoints += weightedMax;

    const response = responses.find((r) => r.questionId === question.id);
    let earned = 0;

    if (response) {
      const correctOptions = question.options.filter((o) => o.isCorrect).map((o) => o.id);
      const selected = response.selectedOptions;

      if (question.questionType === 'mcq') {
        // MCQ: correct if selected matches the single correct option
        const isCorrect = selected.length === 1 && selected[0] === correctOptions[0];
        earned = isCorrect ? weightedMax : 0;

        // Update the response record
        const rIdx = data.responses.findIndex((r) => r.id === response.id);
        if (rIdx !== -1) {
          data.responses[rIdx].isCorrect = isCorrect;
          data.responses[rIdx].pointsEarned = earned;
        }
      } else {
        // Multi-select: partial credit
        const correctSet = new Set(correctOptions);
        const selectedSet = new Set(selected);
        let correctSelections = 0;
        let incorrectSelections = 0;

        for (const s of selectedSet) {
          if (correctSet.has(s)) {
            correctSelections++;
          } else {
            incorrectSelections++;
          }
        }

        // Exact match = full credit, otherwise partial
        const exactMatch = correctSelections === correctSet.size && incorrectSelections === 0;
        if (exactMatch) {
          earned = weightedMax;
        } else {
          // Partial: (correct selections / total correct options) * weighted max, minus penalty for wrong selections
          const partial = correctSet.size > 0
            ? (correctSelections / correctSet.size) * weightedMax
            : 0;
          earned = Math.max(0, Math.round(partial * 100) / 100);
        }

        const rIdx = data.responses.findIndex((r) => r.id === response.id);
        if (rIdx !== -1) {
          data.responses[rIdx].isCorrect = exactMatch;
          data.responses[rIdx].pointsEarned = earned;
        }
      }
    }

    totalPoints += earned;

    // Accumulate per-skill
    if (question.skillId) {
      const existing = skillMap.get(question.skillId) || { earned: 0, max: 0 };
      existing.earned += earned;
      existing.max += weightedMax;
      skillMap.set(question.skillId, existing);
    }
  }

  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 10000) / 100 : 0;

  // Determine pass/fail
  const assessment = data.assessments.find((a) => a.id === session.assessmentId);
  const passed = assessment?.passingScorePct != null ? percentage >= assessment.passingScorePct : null;

  // Remove any existing score for this session
  data.scores = data.scores.filter((s) => s.sessionId !== sessionId);

  const score: Score = {
    id: generateId(),
    sessionId,
    userId: session.userId,
    assessmentId: session.assessmentId,
    totalPoints,
    maxPoints,
    percentage,
    passed,
    scoredAt: now(),
  };
  data.scores.push(score);

  // Remove old proficiency ratings for this score's user/assessment combo and regenerate
  const oldScoreIds = data.scores
    .filter((s) => s.sessionId === sessionId)
    .map((s) => s.id);
  data.proficiencyRatings = data.proficiencyRatings.filter(
    (pr) => pr.userId !== session.userId || !oldScoreIds.includes(pr.scoreId) || pr.scoreId === score.id
  );
  // Actually, clean up any old ratings for this user from the old score
  data.proficiencyRatings = data.proficiencyRatings.filter((pr) => pr.scoreId !== score.id);

  // Generate per-skill proficiency ratings
  for (const [skillId, totals] of skillMap) {
    const pct = totals.max > 0 ? Math.round((totals.earned / totals.max) * 10000) / 100 : 0;
    const rating: ProficiencyRating = {
      id: generateId(),
      scoreId: score.id,
      userId: session.userId,
      skillId,
      level: toProficiencyLevel(pct),
      pointsEarned: totals.earned,
      maxPoints: totals.max,
      percentage: pct,
      ratedAt: score.scoredAt,
    };
    data.proficiencyRatings.push(rating);
  }

  persist();
  return clone(score);
}

export function getScoreBySession(sessionId: string): Score | null {
  const score = data.scores.find((s) => s.sessionId === sessionId) ?? null;
  return score ? clone(score) : null;
}

export function getUserScores(userId: string): Score[] {
  return clone(data.scores.filter((s) => s.userId === userId));
}

export function getAssessmentScores(assessmentId: string): Score[] {
  return clone(data.scores.filter((s) => s.assessmentId === assessmentId));
}

/**
 * Calculate percentile for a given score within an assessment.
 * percentile = (number of scores below / total scores) * 100
 */
export function getPercentile(scoreId: string): number | null {
  const score = data.scores.find((s) => s.id === scoreId);
  if (!score) return null;

  const allScores = data.scores.filter((s) => s.assessmentId === score.assessmentId);
  if (allScores.length <= 1) return 100;

  const below = allScores.filter((s) => s.percentage < score.percentage).length;
  return Math.round((below / allScores.length) * 10000) / 100;
}

// ============ Proficiency ============

export function getProficiencyRatings(userId: string): ProficiencyRating[] {
  return clone(data.proficiencyRatings.filter((pr) => pr.userId === userId));
}

export function getTeamProficiencyRatings(teamId: string): ProficiencyRating[] {
  const teamUserIds = new Set(
    data.users.filter((u) => u.teamId === teamId).map((u) => u.id)
  );
  return clone(
    data.proficiencyRatings.filter((pr) => teamUserIds.has(pr.userId))
  );
}

/**
 * Get the latest proficiency level for a user on a specific skill.
 * Returns the most recently rated entry if multiple exist.
 */
export function getUserSkillProficiency(userId: string, skillId: string): ProficiencyRating | null {
  const ratings = data.proficiencyRatings
    .filter((pr) => pr.userId === userId && pr.skillId === skillId)
    .sort((a, b) => b.ratedAt.localeCompare(a.ratedAt));
  return ratings.length > 0 ? clone(ratings[0]) : null;
}
