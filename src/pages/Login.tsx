
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const { login, loginWithSocial, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);

      const { data: session } = await supabase.auth.getSession();

      if (!session.session) {
        throw new Error("Sessão não encontrada.");
      }

      const userId = session.session.user.id;

      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (adminError) {
        console.error("Erro ao verificar admin:", adminError);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões de administrador",
          variant: "destructive",
        });
      }

      // If user is admin, redirect to admin dashboard
      if (adminUser) {
        navigate("/admin");
      } else {
        // Check if profile is completed
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("profile_completed")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("Erro ao verificar perfil:", profileError);
        }

        // Redirect based on profile completion
        if (profile && !profile.profile_completed) {
          navigate("/profile-completion");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Erro no login:", err);
      toast({
        title: "Erro no login",
        description: "Credenciais inválidas ou erro de conexão",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithSocial("google");
  };

  const handleFacebookLogin = async () => {
    await loginWithSocial("facebook");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Entre com seu e-mail ou redes sociais para acessar o CopySnap AI
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleEmailLogin}>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button disabled={loading} type="submit" className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar com Email"}
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex-grow h-px bg-gray-200" />
                <span className="text-sm text-gray-400">ou</span>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              <Button
                disabled={loading}
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FcGoogle className="h-5 w-5" />}
                <span>Continuar com Google</span>
              </Button>

              <Button
                disabled={loading}
                onClick={handleFacebookLogin}
                variant="outline"
                className="w-full flex items-center gap-2 justify-center bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaFacebook className="h-5 w-5 text-white" />}
                <span>Continuar com Facebook</span>
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
                Registre-se
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
