import { format } from 'date-fns'

interface EmailTemplateData {
    candidateName: string
    interviewDate: Date
    interviewTime: string
    interviewer?: string
    notes?: string
    jobTitle?: string
    companyName?: string
}

export function generateCandidateEmailTemplate({
    candidateName,
    interviewDate,
    interviewTime,
    interviewer,
    jobTitle = 'the position',
    companyName = 'our company',
}: EmailTemplateData) {
    const subject = `Interview Scheduled - ${jobTitle}`

    const body = `Dear ${candidateName},

Thank you for your interest in ${jobTitle} at ${companyName}.

We are pleased to invite you for an interview:

📅 Date: ${format(interviewDate, 'EEEE, MMMM d, yyyy')}
🕐 Time: ${interviewTime}${interviewer ? `\n👤 Interviewer: ${interviewer}` : ''}

Please confirm your availability by replying to this email.

We look forward to speaking with you!

Best regards,
${companyName} Hiring Team`

    return {
        subject,
        body,
        mailto: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
}

export function generateInterviewerEmailTemplate({
    candidateName,
    interviewDate,
    interviewTime,
    notes,
    jobTitle = 'the position',
}: EmailTemplateData) {
    const subject = `Interview Scheduled: ${candidateName} - ${jobTitle}`

    const body = `Hi,

An interview has been scheduled with the following details:

👤 Candidate: ${candidateName}
💼 Position: ${jobTitle}
📅 Date: ${format(interviewDate, 'EEEE, MMMM d, yyyy')}
🕐 Time: ${interviewTime}
${notes ? `\n📝 Notes:\n${notes}` : ''}

Please add this to your calendar and prepare accordingly.

Thank you!`

    return {
        subject,
        body,
        mailto: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
}

export function generateBulkEmailTemplate({
    candidateName,
    candidateEmail,
    interviewDate,
    interviewTime,
    interviewer,
    interviewerEmail,
    jobTitle = 'the position',
}: EmailTemplateData & { candidateEmail: string, interviewerEmail?: string }) {
    const subject = `Interview Scheduled - ${candidateName} | ${jobTitle}`

    const body = `Interview Scheduled

Candidate: ${candidateName} (${candidateEmail})
Position: ${jobTitle}
Date: ${format(interviewDate, 'EEEE, MMMM d, yyyy')}
Time: ${interviewTime}
${interviewer ? `Interviewer: ${interviewer}` : ''}

---
Please ensure both parties are informed.`

    const recipients = [candidateEmail, interviewerEmail].filter(Boolean).join(',')

    return {
        subject,
        body,
        mailto: `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
}
