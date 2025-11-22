/**
 * SEUPSI Data Contracts
 * These interfaces define the data structures for the application and will be used
 * for future backend integration (e.g., Firebase/Supabase).
 */

// User Profile
export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    theme: 'light' | 'dark';
    level: number;
    xp: number;
    streak: number;
    createdAt: string; // ISO Date string
    preferences: {
        notificationsEnabled: boolean;
        dailyGoal: number; // minutes
    };
}

// Daily Journal Entry
export interface DailyEntry {
    id: string;
    userId: string;
    date: string; // ISO Date string (YYYY-MM-DD)
    mood: 'good' | 'neutral' | 'bad';
    content: string;
    tags?: string[];
    createdAt: string;
}

// Mindfulness Session
export interface MeditationSession {
    id: string;
    title: string;
    description: string;
    duration: number; // seconds
    category: 'focus' | 'sleep' | 'anxiety' | 'beginner';
    audioUrl: string;
    thumbnailUrl?: string;
}

// User's Meditation History
export interface MeditationHistory {
    id: string;
    userId: string;
    sessionId: string;
    completedAt: string;
    durationListened: number; // seconds
}

// Studies / Learning Tracks
export interface StudyTrack {
    id: string;
    title: string;
    description: string;
    category: 'biology' | 'philosophy' | 'finance' | 'psychology';
    totalLessons: number;
    lessons: StudyLesson[];
}

export interface StudyLesson {
    id: string;
    trackId: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    contentUrl: string; // URL to video or markdown content
    duration: number; // estimated minutes
}

// User's Study Progress
export interface UserStudyProgress {
    userId: string;
    trackId: string;
    completedLessonIds: string[];
    lastAccessedAt: string;
}

// LibertaMente - Recovery Plan
export interface RecoveryPlan {
    userId: string;
    weeklyGoal: string;
    triggers: string[];
    emergencyContacts: {
        name: string;
        phone: string;
    }[];
    relapseHistory: {
        date: string;
        trigger?: string;
    }[];
}
