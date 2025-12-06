import { z } from 'zod'

export const JobStatusSchema = z.enum(['draft', 'published', 'archived'])
export type JobStatus = z.infer<typeof JobStatusSchema>

export const JobSchema = z.object({
    id: z.string().uuid(),
    org_id: z.string().uuid(),
    team: z.string().nullable(),
    role: z.string().nullable(),
    title: z.string().min(1, "Title is required"),
    slug: z.string().nullable(),
    short_summary: z.string().nullable(),
    content_md: z.string().nullable(),
    required_skills: z.array(z.string()).default([]),
    location: z.string().nullable(),
    employment_type: z.string().nullable(),
    apply_fields: z.union([
        z.array(z.string()),
        z.array(z.object({
            id: z.string(),
            question: z.string(),
            type: z.string(),
            required: z.boolean()
        }))
    ]).default(["name", "email", "phone", "resume"]),
    status: JobStatusSchema,
    created_by: z.string().uuid().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    published_at: z.string().nullable(),
})

export type Job = z.infer<typeof JobSchema>

export interface JobWithStats extends Pick<Job, 'id' | 'org_id' | 'title' | 'team' | 'role' | 'status' | 'updated_at'> {
    applicants_count: number
    avg_score: number | null
}

export const CreateJobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    team: z.string().optional(),
    role: z.string().optional(),
    status: JobStatusSchema.default('draft'),
    short_summary: z.string().optional(),
    content_md: z.string().optional(),
    required_skills: z.array(z.string()).optional(),
    location: z.string().optional(),
    employment_type: z.string().optional(),
    apply_fields: z.union([
        z.array(z.string()),
        z.array(z.object({
            id: z.string(),
            question: z.string(),
            type: z.string(),
            required: z.boolean()
        }))
    ]).optional()
})

export type CreateJobInput = z.infer<typeof CreateJobSchema>
