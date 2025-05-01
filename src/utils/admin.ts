import { supabase } from "@/integrations/supabase/client";
import { PostgrestError, PostgrestSingleResponse } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email?: string;
}

/**
 * Look up a user by their email address
 */
export const getUserByEmail = async (email: string): Promise<{ user: UserProfile | null, error: Error | null }> => {
  try {
    // Since we can't directly access auth.users, we need to check the profiles table
    const { data, error }: PostgrestSingleResponse<{ id: string }> = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user:", error);
      return { user: null, error };
    }
    
    if (!data) {
      return { user: null, error: new Error('User not found') };
    }
    
    return { user: { id: data.id }, error: null };
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return { user: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

/**
 * Fetch all admin users with their email information
 */
export const fetchAdminUsers = async () => {
  try {
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('*');
    
    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }

    // Get emails for each admin user
    const adminsWithEmails = await Promise.all(
      admins.map(async (admin) => {
        // Use auth.admin APIs to get user details (note: this will only work in edge functions)
        // Here we're just showing the user_id as a demo
        return {
          ...admin,
          email: `admin_${admin.user_id.substring(0, 8)}@example.com` // Placeholder
        };
      })
    );
    
    return adminsWithEmails;
  } catch (error) {
    console.error("Error in fetchAdminUsers:", error);
    throw error;
  }
};
