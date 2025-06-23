
import { ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2024 - Assistant RAG Interne - Usage strictement professionnel
          </div>
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-[#A100FF] transition-colors flex items-center space-x-1"
            >
              <span>Documentation</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-[#A100FF] transition-colors flex items-center space-x-1"
            >
              <span>Support IT</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-[#A100FF] transition-colors flex items-center space-x-1"
            >
              <span>Mentions légales</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
