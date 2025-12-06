export function generateGoogleCalendarLink({
    title,
    description,
    location,
    startDate,
    endDate,
}: {
    title: string
    description?: string
    location?: string
    startDate: Date
    endDate: Date
}) {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: description || '',
        location: location || 'Video Call',
    })

    return `https://calendar.google.com/calendar/render?${params}`
}

export function generateOutlookCalendarLink({
    title,
    description,
    location,
    startDate,
    endDate,
}: {
    title: string
    description?: string
    location?: string
    startDate: Date
    endDate: Date
}) {
    const formatDate = (date: Date) => {
        return date.toISOString()
    }

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: title,
        body: description || '',
        location: location || 'Video Call',
        startdt: formatDate(startDate),
        enddt: formatDate(endDate),
    })

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`
}

export function generateICSFile({
    title,
    description,
    location,
    startDate,
    endDate,
}: {
    title: string
    description?: string
    location?: string
    startDate: Date
    endDate: Date
}) {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description || ''}
LOCATION:${location || 'Video Call'}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    return URL.createObjectURL(blob)
}
