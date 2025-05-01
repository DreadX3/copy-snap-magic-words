
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-heading font-bold gradient-text">CopySnap AI</span>
              </Link>
            </div>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 font-medium">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 font-medium">
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sair
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.isPro ? "PRO" : "Free"}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <span className="sr-only">Abrir menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sair
                </Button>
                <div className="flex items-center px-3 py-2 space-x-2">
                  <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.isPro ? "PRO" : "Free"}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
