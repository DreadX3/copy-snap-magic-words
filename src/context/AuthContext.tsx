
import React, { createContext, useState } from "react";
import { AuthContextType, User } from "@/types/auth.types";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useAuthSession } from "@/hooks/useAuthSession";

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export custom hook for using the context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    loading,
    setLoading,
    login,
    register,
    logout
  } = useSupabaseAuth();
  
  // Initialize auth session
  useAuthSession(setUser, setLoading);
  
  // Provide context value to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
