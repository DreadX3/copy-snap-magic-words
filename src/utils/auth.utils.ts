
import { supabase } from "@/lib/supabase";
import { User } from "@/types/auth.types";

export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  const { data: adminData, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  return adminError ? false : !!adminData;
};

export const fetchUserProfile = async (userId: string): Promise<any> => {
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile:", error);
    return null;
  }
  
  return profileData;
};

export const createUserObject = (userId: string, email: string, profileData: any, isAdmin: boolean): User => {
  return {
    id: userId,
    email: email || "",
    isPro: profileData?.is_pro || false,
    dailyQuota: profileData?.is_pro ? 999 : 10, // 10 for basic plan
    usedToday: profileData?.used_today || 0,
    usedMonth: profileData?.used_month || 0,
    lastUsageDay: profileData?.last_usage_day || null,
    lastUsageMonth: profileData?.last_usage_month || null,
    lastUsageYear: profileData?.last_usage_year || null,
    isAdmin: isAdmin
  };
};
