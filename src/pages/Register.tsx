import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { register, loginWithSocial, loading } = useAuth(); // Correção: um único `useAuth`

  // Validação da senha
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("As senhas não correspondem");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Social login handlers
  const handleGoogleRegister = async () => {
    await loginWithSocial("google");
  };

  const handleFacebookRegister = async () => {
    await loginWithSocial("facebook");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    await register(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
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

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password">Senha</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
              />
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button disabled={loading} type="submit" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando
                </>
              ) : (
                "Registrar"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
