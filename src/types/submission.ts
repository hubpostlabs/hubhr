export interface Submission {
    id: string
    created_at: string
    job_id: string
    name: string
    email: string
    phone: string
    resume_path: string
    resume_mime: string
    status: 'new' | 'reviewed' | 'interviewing' | 'rejected' | 'hired'
    score?: number | null
    reviewer_notes?: any
    jobs?: {
        title: string
    }
}
