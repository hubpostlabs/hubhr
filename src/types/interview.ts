// Interview round types
export interface InterviewRound {
    round_number: number
    round_type: 'phone_screen' | 'technical' | 'manager' | 'panel' | 'cultural' | 'final'
    scheduled_date?: string
    scheduled_time?: string
    interviewer?: string
    interviewer_email?: string
    status: 'scheduled' | 'completed' | 'cancelled'
    feedback?: string
    outcome?: 'pass' | 'fail' | 'pending'
    completed_at?: string
    notes?: string
    created_at: string
}

export const ROUND_TYPE_LABELS: Record<InterviewRound['round_type'], string> = {
    phone_screen: 'Phone Screen',
    technical: 'Technical Interview',
    manager: 'Manager Interview',
    panel: 'Panel Interview',
    cultural: 'Cultural Fit',
    final: 'Final Round'
}
