
import { Navigation } from "@/components/Navigation";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Assistant RAG Interne" />
      <Navigation activeTab="rag" />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assistant RAG</h2>
            <p className="text-gray-600">Interrogez votre base documentaire interne d'entreprise</p>
          </div>
          <ChatInterface 
            placeholder="Posez votre question sur les documents de l'entreprise..."
            chatType="rag"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
