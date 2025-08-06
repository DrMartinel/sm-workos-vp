import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/shared-ui/lib/utils/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, updated_at, username, avatar_url, sm_rewards_balance, role')
      .order('username', { ascending: true })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      )
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Then get auth users to get emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      // Return profiles without emails if auth fetch fails
      const usersWithoutEmails = profiles.map(profile => ({ ...profile, email: undefined }))
      return NextResponse.json({ users: usersWithoutEmails })
    }

    // Create a map of user IDs to emails
    const emailMap = new Map<string, string>()
    authUsers.users.forEach(user => {
      emailMap.set(user.id, user.email || '')
    })

    // Combine profiles with emails
    const usersWithEmails = profiles.map(profile => ({
      ...profile,
      email: emailMap.get(profile.id) || undefined
    }))

    return NextResponse.json({ users: usersWithEmails })
  } catch (error) {
    console.error('Error in GET /api/admin/users/list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 