
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
}

// Create a Supabase client with the service role key for admin operations
const getServiceRoleClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )
}

const resetUsers = async () => {
  const supabase = getServiceRoleClient()
  
  try {
    // Step 1: Delete all admin users (using service role)
    await supabase
      .from('admin_users')
      .delete()
      .neq('id', '')
    
    console.log('Deleted all admin users')

    // Step 2: Delete all user profiles (using service role)
    await supabase
      .from('profiles')
      .delete()
      .neq('id', '')
    
    console.log('Deleted all user profiles')

    // Step 3: Get list of all users to delete
    const { data: users } = await supabase.auth.admin.listUsers()
    
    // Step 4: Delete each user
    if (users) {
      for (const user of users.users) {
        await supabase.auth.admin.deleteUser(user.id)
        console.log(`Deleted user: ${user.email}`)
      }
    }

    // Step 5: Create the new super admin user
    const email = 'dreadx3@gmail.com'
    const password = '@Dread325'
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email so login works immediately
    })

    if (createError) {
      throw new Error(`Error creating user: ${createError.message}`)
    }
    
    if (!newUser.user) {
      throw new Error('User was not created properly')
    }
    
    console.log(`Created new user: ${email} with ID: ${newUser.user.id}`)
    
    // Step 6: Create admin record for the new user
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: newUser.user.id,
        is_super_admin: true
      })
    
    if (adminError) {
      throw new Error(`Error creating admin user: ${adminError.message}`)
    }
    
    console.log(`Added user to admin_users as super admin`)

    return { success: true, message: 'All users reset and new super admin created' }
  } catch (error) {
    console.error('Error in reset-users function:', error.message)
    return { success: false, error: error.message }
  }
}

// Main function to handle the request
Deno.serve(async (req: Request) => {
  // Check if this is a CORS preflight request
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse
  
  try {
    // This endpoint should only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const result = await resetUsers()
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
