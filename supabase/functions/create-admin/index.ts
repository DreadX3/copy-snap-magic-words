
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Auth context
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create the admin user if it doesn't exist
    const { data: existingUser, error: findError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'admin@copysnap.ai')
      .maybeSingle();
      
    if (findError) {
      console.error("Error finding user:", findError);
      return new Response(JSON.stringify({ error: "Error finding user" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
    
    let userId;
    
    if (!existingUser) {
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@copysnap.ai',
        password: 'adm123456',
        email_confirm: true
      });
      
      if (authError) {
        console.error("Error creating user:", authError);
        return new Response(JSON.stringify({ error: "Error creating user" }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        });
      }
      
      userId = authData.user.id;
    } else {
      userId = existingUser.id;
    }
    
    // Add user to admin_users table as super admin
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert([
        { 
          user_id: userId,
          is_super_admin: true
        }
      ]);
      
    if (adminError) {
      console.error("Error adding admin:", adminError);
      return new Response(JSON.stringify({ error: "Error adding admin" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Admin user created successfully", 
      email: "admin@copysnap.ai",
      password: "adm123456" 
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
