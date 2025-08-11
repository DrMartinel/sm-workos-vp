import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/shared-ui/lib/utils/supabase/admin'
import { SystemRole } from '@/app/shared-ui/lib/utils/supabase/roles'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, roles } = await request.json()
    
    // Validate input - roles are now optional
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure roles is an array (default to empty array if not provided)
    const userRoles = Array.isArray(roles) ? roles : []

    const supabase = createAdminClient()
    
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    })

    if (authError) {
      console.error('Error creating user in auth:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create profile - email is stored in auth.users, so we only store username and roles in profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        role: userRoles,
        sm_rewards_balance: 0,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, username, roles } = await request.json()
    
    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure roles is an array (default to empty array if not provided)
    const userRoles = Array.isArray(roles) ? roles : []

    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        role: userRoles,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 