import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate caller identity
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized: Missing Authorization header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // Role check priorities: 1. Metadata 2. Profiles Table
    let roleFromMetadata = user.user_metadata?.role
    let isAdmin = roleFromMetadata === 'admin'
    
    // Fallback: Check profiles table if NOT in metadata or if we want to be double sure
    if (!isAdmin) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      isAdmin = profile?.role === 'admin'
    }

    if (!isAdmin) {
      // Return 200 with an error object so the UI can show the message
      return new Response(JSON.stringify({ error: `Forbidden: Only admins can manage staff. Your role: ${roleFromMetadata || 'none'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Parse request payload
    const payload = await req.json()
    const { email, password, username, fullName, phone, address, role } = payload

    // 3. Initialize secure Admin hook
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Internal Server Error: Missing Service Role Key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 so UI shows this error
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    )

    // 4. Create Auth User
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username,
        role: role || 'staff',
        full_name: fullName
      }
    })

    if (createError) throw createError

    // 5. Update Profile overrides (the trigger forces strictly staff, we override with admin keys)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role || 'staff', is_approved: true })
      .eq('id', newUser.user.id)
    
    if (profileError) console.error("Error updating profile:", profileError)

    // 6. Provide staff table record
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .insert([{
        name: fullName || username,
        role: role === 'attendance_admin' ? 'ATTENDANCE ADMIN' : 'SALES ASSOCIATE',
        joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        phone: phone || 'N/A',
        address: address || '',
        username: username,
        avatarBg: '#E8EAF6'
      }])

    if (staffError) console.error("Error creating staff record:", staffError)

    return new Response(JSON.stringify({ user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // We return 200 for logical errors so the frontend can catch the "error" field in the body
    // Otherwise the Supabase SDK shows a generic "non-2xx" error.
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
