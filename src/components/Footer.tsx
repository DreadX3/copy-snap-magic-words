
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mt-8 flex justify-center space-x-6">
          <Link to="/" className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Home</span>
          </Link>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} CopySnap AI. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
