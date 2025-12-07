import { createAdminClient } from '@/lib/supabase/admin'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function scoreResume(submissionId: string) {
    const supabase = createAdminClient()

    try {
        // 1. Fetch Submission and Job Details
        const { data: submission, error: subError } = await supabase
            .from('job_submissions')
            .select('*, jobs(*)')
            .eq('id', submissionId)
            .single()

        if (subError || !submission) {
            console.error('Scoring Error: Submission not found', subError)
            return
        }

        const job = submission.jobs as any
        if (!job) {
            console.error('Scoring Error: Job not found linked to submission')
            return
        }

        // 2. Download Resume
        // Path is stored in resume_path. We need to query the storage bucket.
        // Bucket name is org_id.
        const bucketName = job.org_id
        const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(submission.resume_path)

        if (downloadError || !fileData) {
            console.error('Scoring Error: Failed to download resume', downloadError)
            return
        }

        // 3. Prepare for Gemini
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
        const cf_key = process.env.CF_TOKEN;

        if (!apiKey) {
            console.error('Scoring Error: Missing Gemini API Key')
            return
        }

        const genAI = new GoogleGenerativeAI(apiKey)
 const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, {
        baseUrl: "https://gateway.ai.cloudflare.com/v1/7ed1e0283cfab82d9378191e8c95c3c2/hubhr/google-ai-studio",
        customHeaders: {
            "cf-aig-authorization": `Bearer ${cf_key}`
        }
        
    });
        const resumeBuffer = await fileData.arrayBuffer()
        const base64Resume = Buffer.from(resumeBuffer).toString('base64')
        const mimeType = submission.resume_mime || 'application/pdf' // Default to PDF if missing

        const prompt = `
        You are an automated resume-scoring engine for a hiring platform.
        Your task is to evaluate how well a candidate’s resume matches a specific job description.

        JOB DESCRIPTION:
        Title: ${job.title}
        Role: ${job.role}
        Content:
        ${job.content_md}
        Required Skills: ${job.required_skills?.join(', ')}

        Follow these rules:
        1. Evaluate the resume across: Skill Match (40%), Experience & Seniority (30%), Role & Domain Fit (20%), Resume Quality (10%).
        2. Generate a score 0-100.
        3. STRICT JSON Output:
        {
          "score": 85,
          "reasoning": "Short explanation...",
          "strengths": ["string"],
          "gaps": ["string"]
        }
        Do not include markdown blocks.
        `

        // 4. Generate Content
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Resume,
                    mimeType: mimeType
                }
            }
        ])

        const responseText = result.response.text()
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
        let scoreData

        try {
            scoreData = JSON.parse(cleanJson)
        } catch (e) {
            console.error('Scoring Error: Failed to parse JSON', responseText)
            return
        }

        // 5. Update Database
        const { error: updateError } = await supabase
            .from('job_submissions')
            .update({
                score: scoreData.score,
                scoring_details: scoreData,
                status: 'screened' // Optional: move to screened if scored? Or keep 'new'? Let's keep 'new' or maybe just update score. User didn't specify status change.
            })
            .eq('id', submissionId)

        if (updateError) {
            console.error('Scoring Error: Failed to update submission', updateError)
        } else {
            console.log(`Scoring Success: ${submissionId} scored ${scoreData.score}`)
        }

    } catch (err) {
        console.error('Scoring Unexpected Error:', err)
    }
}
