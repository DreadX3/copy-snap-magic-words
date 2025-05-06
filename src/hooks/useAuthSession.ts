
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { checkAdminStatus, fetchUserProfile, createUserObject } from "@/utils/auth.utils";

export const useAuthSession = (setUser, setLoading) => {
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile data
          const profileData = await fetchUserProfile(session.user.id);
            
          // Check admin status
          const isAdmin = await checkAdminStatus(session.user.id);
          
          // Create user object
          const userObj = createUserObject(
            session.user.id, 
            session.user.email || "", 
            profileData, 
            isAdmin
          );
          
          setUser(userObj);
          localStorage.setItem("user", JSON.stringify(userObj));
          
          // Redirect admin to admin dashboard if on login page
          if (isAdmin && window.location.pathname === '/login') {
            navigate('/admin');
          }
        } else {
          // Try to load from localStorage as fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading user session:", error);
        setLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer data fetching to prevent deadlocks
          setTimeout(async () => {
            const profileData = await fetchUserProfile(session.user.id);
            const isAdmin = await checkAdminStatus(session.user.id);
            const userObj = createUserObject(
              session.user.id, 
              session.user.email || "", 
              profileData, 
              isAdmin
            );
            
            setUser(userObj);
            localStorage.setItem("user", JSON.stringify(userObj));
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("user");
        }
      }
    );
    
    // Load initial user
    loadUser();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, navigate]);
};
