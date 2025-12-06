import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    console.log("------------------- AUTH CALLBACK -------------------")
    console.log("Code Present:", !!code)
    console.log("Origin:", origin)
    console.log("Next:", next)
    const {NEXT_PUBLIC_SITE_URL} = process.env;

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("Auth Exchange Error:", error)
        } else {
            console.log("Auth Exchange Success")
        }

        if (!error) {
            return NextResponse.redirect(   `${NEXT_PUBLIC_SITE_URL}/${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
