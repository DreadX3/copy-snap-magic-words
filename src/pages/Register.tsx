
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const Register = () => {
  const { loginWithSocial, loading } = useAuth();
  
  const handleGoogleRegister = async () => {
    await loginWithSocial('google');
  };
  
  const handleFacebookRegister = async () => {
    await loginWithSocial('facebook');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Registre-se com suas redes sociais para começar a usar o CopySnap AI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              disabled={loading} 
              onClick={handleGoogleRegister} 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}
              <span>Registrar com Google</span>
            </Button>
            
            <Button 
              disabled={loading} 
              onClick={handleFacebookRegister} 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FaFacebook className="h-5 w-5 text-white" />
              )}
              <span>Registrar com Facebook</span>
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
