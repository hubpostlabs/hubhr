export interface Submission {
    id: string
    created_at: string
    job_id: string
    name: string
    email: string
    phone: string
    resume_path: string
    resume_mime: string
    resume_url?: string
}

export type SubmissionStatus =
    | 'new'
    | 'reviewed'
    | 'shortlisted'
    | 'interview_scheduled'
    | 'interviewing'
    | 'interviewed'
    | 'rejected'
    | 'hired'
    | 'offer'

export interface Submission {
    id: string
    created_at: string
    job_id: string
    name: string
    email: string
    phone: string
    resume_path: string
    resume_mime: string
    resume_url?: string
    status: SubmissionStatus
    score?: number | null
    scoring_details?: {
        score: number
        reasoning: string
        strengths: string[]
        gaps: string[]
    }
    reviewer_notes?: any
    jobs?: {
        title: string
    }
}
