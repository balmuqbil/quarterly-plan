// ============ Enums ============

export type UserRole = 'admin' | 'manager' | 'team_member' | 'hr_ld';
export type PracticeArea = 'software_development' | 'application_integration' | 'system_integration';
export type ProficiencyLevel = 'foundational' | 'developing' | 'proficient' | 'expert';
export type QuestionType = 'mcq' | 'multi_select';
export type QuestionStatus = 'draft' | 'review' | 'approved';
export type BloomsLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AssessmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type SessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'timed_out';

// ============ Data Models ============

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  teamId: string | null;
  practiceArea: PracticeArea | null;
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  practiceArea: PracticeArea;
  managerId: string | null;
  createdAt: string;
}

export interface CompetencyDomain {
  id: string;
  name: string;
  description: string;
  practiceArea: PracticeArea;
  sortOrder: number;
}

export interface CompetencySubdomain {
  id: string;
  domainId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Skill {
  id: string;
  subdomainId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  questionType: QuestionType;
  options: QuestionOption[];
  explanation: string;
  difficulty: DifficultyLevel;
  bloomsLevel: BloomsLevel;
  skillId: string | null;
  status: QuestionStatus;
  createdBy: string;
  reviewedBy: string | null;
  reviewNotes: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  practiceArea: PracticeArea | null;
  timeLimitMinutes: number | null;
  passingScorePct: number | null;
  randomizeQuestions: boolean;
  questionsCount: number | null;
  openAt: string | null;
  closeAt: string | null;
  status: AssessmentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionId: string;
  sortOrder: number;
  weight: number;
}

export interface AssessmentSession {
  id: string;
  assessmentId: string;
  userId: string;
  status: SessionStatus;
  startedAt: string | null;
  submittedAt: string | null;
  timeRemainingSeconds: number | null;
  questionOrder: string[];
  createdAt: string;
}

export interface SessionResponse {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean | null;
  pointsEarned: number;
  answeredAt: string;
}

export interface Score {
  id: string;
  sessionId: string;
  userId: string;
  assessmentId: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean | null;
  scoredAt: string;
}

export interface ProficiencyRating {
  id: string;
  scoreId: string;
  userId: string;
  skillId: string;
  level: ProficiencyLevel;
  pointsEarned: number;
  maxPoints: number;
  percentage: number;
  ratedAt: string;
}

// ============ UI Types ============

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

export const PRACTICE_AREA_LABELS: Record<PracticeArea, string> = {
  software_development: 'Software Development',
  application_integration: 'Application Integration',
  system_integration: 'System Integration',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  team_member: 'Team Member',
  hr_ld: 'HR / L&D',
};

export const PROFICIENCY_LABELS: Record<ProficiencyLevel, string> = {
  foundational: 'Foundational',
  developing: 'Developing',
  proficient: 'Proficient',
  expert: 'Expert',
};

export const PROFICIENCY_COLORS: Record<ProficiencyLevel, string> = {
  foundational: 'bg-red-100 text-red-800 border-red-200',
  developing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  proficient: 'bg-green-100 text-green-800 border-green-200',
  expert: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const BLOOMS_LABELS: Record<BloomsLevel, string> = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
  evaluate: 'Evaluate',
  create: 'Create',
};
