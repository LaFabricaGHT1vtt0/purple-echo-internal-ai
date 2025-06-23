
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: "rag" | "infra";
}

export const Navigation = ({ activeTab }: NavigationProps) => {
  const location = useLocation();

  const tabs = [
    {
      id: "rag",
      label: "Assistant RAG",
      path: "/",
      icon: MessageSquare,
      description: "Base documentaire"
    },
    {
      id: "infra",
      label: "Agent Infra",
      path: "/agent-infra",
      icon: Server,
      description: "Infrastructure technique"
    }
  ];

  return (
    <nav className="bg-gray-50 px-6 py-4">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
                isActive
                  ? "bg-[#A100FF] text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-[#A100FF] hover:bg-white hover:shadow-md"
              )}
            >
              <Icon className="h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{tab.label}</span>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-purple-100" : "text-gray-500"
                )}>
                  {tab.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
