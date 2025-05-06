
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = "sk_test_51RHv2pAndPuzxEEW15psdyNjYjczpzlXaPUu4nTheJnvlqbiQZ2sWRrafQez28x3EeuLKH5xbRLOg1OfKb2HnSn800Ys50DWh7";
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Check current usage stats
      const { data: usageData } = await supabaseClient
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      // Initialize usage if not exists
      if (!usageData) {
        await supabaseClient.from('user_usage').insert({
          user_id: user.id,
          email: user.email,
          used_today: 0,
          used_month: 0,
          month: month,
          year: year,
          updated_at: new Date().toISOString()
        });
      }
        
      return new Response(JSON.stringify({ 
        subscribed: false,
        dailyQuota: 10,
        monthlyQuota: 50
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });

      // Update profile for pro user
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);
        
      if (updateError) {
        logStep("Error updating profile", { error: updateError.message });
      }
      
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: subscriptionEnd,
        dailyQuota: 999, // Unlimited for PRO
        monthlyQuota: 9999 // Unlimited for PRO
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Not subscribed
      // Update profile for basic user
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', user.id);
        
      if (updateError) {
        logStep("Error updating profile", { error: updateError.message });
      }
      
      return new Response(JSON.stringify({
        subscribed: false,
        dailyQuota: 10,
        monthlyQuota: 50
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
