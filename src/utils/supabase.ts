import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  Goal,
  Milestone,
  JournalEntry,
  FinanceData,
  CalendarEvent,
  ChatMessage,
} from '../types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Checks if Supabase credentials are provided and valid (non-placeholder).
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawUrl &&
    rawKey &&
    typeof rawUrl === 'string' &&
    rawUrl.trim().startsWith('http') &&
    rawKey.trim() !== '' &&
    !rawUrl.includes('your-project.supabase.co')
  );
};

/**
 * Safe Supabase client initialization.
 * Returns null if not configured or if initialization fails, preventing app crash.
 */
export const supabase: SupabaseClient | null = (() => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return createClient(rawUrl as string, rawKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.warn('[PocketMentor Supabase] Failed to initialize client:', err);
    return null;
  }
})();

// ============================================================================
// 1. PROFILES TABLE SYNC
// Columns: id, name, email, avatar_url, origin, stage, college_semester, major,
// current_role, industry, interests, career_direction, desired_contribution,
// target_destination, focus_areas, reminder_time, banner_notifications, onboarded,
// activity_dates, updated_at
// ============================================================================
export async function syncProfileToSupabase(
  profile: UserProfile,
  activityDates?: string[]
): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatarUrl || null,
      origin: profile.origin || '',
      stage: profile.stage,
      college_semester: profile.collegeSemester ?? null,
      major: profile.major || null,
      current_role: profile.currentRole || null,
      industry: profile.industry || null,
      interests: profile.interests || [],
      career_direction: profile.careerDirection || null,
      desired_contribution: profile.desiredContribution || null,
      target_destination: profile.targetDestination || null,
      focus_areas: profile.focusAreas || [],
      reminder_time: profile.reminderTime || '20:00',
      banner_notifications: profile.bannerNotifications ?? true,
      onboarded: profile.onboarded ?? true,
      activity_dates: activityDates || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncProfileToSupabase error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncProfileToSupabase exception:', err);
  }
}

export async function fetchProfileFromSupabase(
  userId: string
): Promise<{ profile: Partial<UserProfile>; activityDates?: string[] } | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[PocketMentor Supabase] fetchProfileFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    const profile: Partial<UserProfile> = {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url || undefined,
      origin: data.origin,
      stage: data.stage,
      collegeSemester: data.college_semester ?? undefined,
      major: data.major || '',
      currentRole: data.current_role || '',
      industry: data.industry || '',
      interests: Array.isArray(data.interests) ? data.interests : [],
      careerDirection: data.career_direction || '',
      desiredContribution: data.desired_contribution || '',
      targetDestination: data.target_destination || '',
      focusAreas: Array.isArray(data.focus_areas) ? data.focus_areas : [],
      reminderTime: data.reminder_time || '20:00',
      bannerNotifications: data.banner_notifications ?? true,
      onboarded: data.onboarded ?? true,
    };

    const activityDates = Array.isArray(data.activity_dates) ? data.activity_dates : undefined;

    return { profile, activityDates };
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchProfileFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 2. GOALS TABLE SYNC
// Columns: id, user_id, title, completed, category, linked_milestone_id, date
// ============================================================================
export async function syncGoalUpsert(userId: string, goal: Goal): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: goal.id,
      user_id: userId,
      title: goal.title,
      completed: goal.completed,
      category: goal.category,
      linked_milestone_id: goal.linkedMilestoneId || null,
      date: goal.date,
    };

    const { error } = await supabase.from('goals').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncGoalUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncGoalUpsert exception:', err);
  }
}

export async function syncGoalDelete(userId: string, goalId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.warn('[PocketMentor Supabase] syncGoalDelete error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncGoalDelete exception:', err);
  }
}

export async function fetchGoalsFromSupabase(userId: string): Promise<Goal[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('[PocketMentor Supabase] fetchGoalsFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    return data.map((g) => ({
      id: g.id,
      title: g.title,
      completed: Boolean(g.completed),
      category: g.category,
      linkedMilestoneId: g.linked_milestone_id || undefined,
      date: g.date,
    }));
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchGoalsFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 3. MILESTONES TABLE SYNC
// Columns: id, user_id, stage_id, category_id, sub_phase_id, title,
// description, category, completed, converted_to_goal_id
// ============================================================================
export async function syncMilestoneUpsert(userId: string, milestone: Milestone): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: milestone.id,
      user_id: userId,
      stage_id: milestone.stageId,
      category_id: milestone.categoryId || null,
      sub_phase_id: milestone.subPhaseId || null,
      title: milestone.title,
      description: milestone.description || '',
      category: milestone.category,
      completed: milestone.completed,
      converted_to_goal_id: milestone.convertedToGoalId || null,
    };

    const { error } = await supabase.from('milestones').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncMilestoneUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncMilestoneUpsert exception:', err);
  }
}

export async function fetchMilestonesFromSupabase(
  userId: string
): Promise<Array<{ id: string; completed: boolean; convertedToGoalId?: string }> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('id, completed, converted_to_goal_id')
      .eq('user_id', userId);

    if (error) {
      console.warn('[PocketMentor Supabase] fetchMilestonesFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    return data.map((m) => ({
      id: m.id,
      completed: Boolean(m.completed),
      convertedToGoalId: m.converted_to_goal_id || undefined,
    }));
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchMilestonesFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 4. JOURNAL ENTRIES TABLE SYNC
// Columns: id, user_id, date, prompt, content, mood, updated_at
// ============================================================================
export async function syncJournalUpsert(userId: string, entry: JournalEntry): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: entry.id,
      user_id: userId,
      date: entry.date,
      prompt: entry.prompt,
      content: entry.content,
      mood: entry.mood,
      updated_at: entry.updatedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from('journal_entries').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncJournalUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncJournalUpsert exception:', err);
  }
}

export async function syncJournalDelete(userId: string, entryId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      console.warn('[PocketMentor Supabase] syncJournalDelete error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncJournalDelete exception:', err);
  }
}

export async function fetchJournalFromSupabase(userId: string): Promise<JournalEntry[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('[PocketMentor Supabase] fetchJournalFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    return data.map((j) => ({
      id: j.id,
      date: j.date,
      prompt: j.prompt,
      content: j.content,
      mood: j.mood,
      updatedAt: j.updated_at || j.date,
    }));
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchJournalFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 5. FINANCE DATA TABLE SYNC
// Columns: user_id, monthly_income, currency, needs_percent, wants_percent,
// savings_percent, emergency_fund_target_months, emergency_fund_current, updated_at
// ============================================================================
export async function syncFinanceUpsert(userId: string, finance: FinanceData): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      user_id: userId,
      monthly_income: finance.monthlyIncome,
      currency: finance.currency,
      needs_percent: finance.needsPercent,
      wants_percent: finance.wantsPercent,
      savings_percent: finance.savingsPercent,
      emergency_fund_target_months: finance.emergencyFundTargetMonths,
      emergency_fund_current: finance.emergencyFundCurrent,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('finance_data').upsert(payload, {
      onConflict: 'user_id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncFinanceUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncFinanceUpsert exception:', err);
  }
}

export async function fetchFinanceFromSupabase(userId: string): Promise<FinanceData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('finance_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[PocketMentor Supabase] fetchFinanceFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    return {
      monthlyIncome: Number(data.monthly_income) || 0,
      currency: (data.currency as 'IDR' | 'USD') || 'IDR',
      needsPercent: Number(data.needs_percent) || 50,
      wantsPercent: Number(data.wants_percent) || 30,
      savingsPercent: Number(data.savings_percent) || 20,
      emergencyFundTargetMonths: Number(data.emergency_fund_target_months) || 3,
      emergencyFundCurrent: Number(data.emergency_fund_current) || 0,
    };
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchFinanceFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 6. CALENDAR EVENTS TABLE SYNC
// Columns: id, user_id, title, date, time, location, urgency, type, description, completed
// ============================================================================
export async function syncCalendarEventUpsert(userId: string, event: CalendarEvent): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: event.id,
      user_id: userId,
      title: event.title,
      date: event.date,
      time: event.time || null,
      location: event.location || null,
      urgency: event.urgency,
      type: event.type || null,
      description: event.description || null,
      completed: event.completed,
    };

    const { error } = await supabase.from('calendar_events').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncCalendarEventUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncCalendarEventUpsert exception:', err);
  }
}

export async function syncCalendarEventDelete(userId: string, eventId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    if (error) {
      console.warn('[PocketMentor Supabase] syncCalendarEventDelete error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncCalendarEventDelete exception:', err);
  }
}

export async function fetchCalendarEventsFromSupabase(userId: string): Promise<CalendarEvent[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.warn('[PocketMentor Supabase] fetchCalendarEventsFromSupabase error:', error.message);
      return null;
    }
    if (!data) return null;

    return data.map((ev) => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      time: ev.time || undefined,
      location: ev.location || undefined,
      urgency: ev.urgency,
      type: ev.type || undefined,
      description: ev.description || undefined,
      completed: Boolean(ev.completed),
    }));
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchCalendarEventsFromSupabase exception:', err);
    return null;
  }
}

// ============================================================================
// 7. CHAT MESSAGES TABLE SYNC
// Columns: id, user_id, role, content, timestamp, created_at
// ============================================================================
export async function syncChatMessageUpsert(userId: string, msg: ChatMessage): Promise<void> {
  if (!supabase) return;
  try {
    const payload = {
      id: msg.id,
      user_id: userId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('chat_messages').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      console.warn('[PocketMentor Supabase] syncChatMessageUpsert error:', error.message);
    }
  } catch (err) {
    console.warn('[PocketMentor Supabase] syncChatMessageUpsert exception:', err);
  }
}

export async function fetchChatMessagesFromSupabase(userId: string): Promise<ChatMessage[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[PocketMentor Supabase] fetchChatMessagesFromSupabase error:', error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((m) => ({
      id: m.id,
      role: (m.role as 'user' | 'model') || 'user',
      content: m.content,
      timestamp: m.timestamp,
    }));
  } catch (err) {
    console.warn('[PocketMentor Supabase] fetchChatMessagesFromSupabase exception:', err);
    return null;
  }
}
