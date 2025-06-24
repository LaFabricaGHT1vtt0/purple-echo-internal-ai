
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: string[];
}

interface ChatInterfaceProps {
  placeholder: string;
  chatType: "rag" | "infra";
}

export const ChatInterface = ({ placeholder, chatType }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Créer le message du bot avec un contenu vide pour le streaming
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, botMessage]);

    try {
      const response = await fetch("/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: currentInput }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Impossible de lire la réponse");
      
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";
      let sources: string[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("Chunk reçu:", chunk);

        // Accumuler les chunks dans le buffer
        buffer += chunk;

        // Utiliser une expression régulière pour extraire le texte utile
        const textMatches = [...buffer.matchAll(/"text"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g)];

        if (textMatches.length > 0) {
          const extractedText = textMatches.map(match => {
            return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
          }).join('');

          fullText += extractedText;
          
          // Mettre à jour le message en temps réel
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: fullText }
              : msg
          ));

          // Supprimer les parties déjà traitées du buffer
          buffer = buffer.replace(/"text"\s*:\s*"[^"\\]*(?:\\.[^"\\]*)*"/g, '');
        }

        // Vérifier si le buffer contient des sources complètes
        const sourcesStart = buffer.indexOf('"sources": [');
        if (sourcesStart !== -1) {
          const sourcesEnd = buffer.lastIndexOf(']');
          if (sourcesEnd !== -1 && sourcesEnd > sourcesStart) {
            const sourcesJSONText = buffer.substring(sourcesStart, sourcesEnd + 1);
            try {
              const sourcesData = JSON.parse(`{${sourcesJSONText}}`).sources;
              sources = sourcesData.map((source: any) => source.doc_title);
              buffer = buffer.substring(sourcesEnd + 1);
            } catch (e) {
              console.error("Erreur lors du parsing des sources:", e);
            }
          }
        }

        scrollToBottom();
        await new Promise(r => setTimeout(r, 10));
      }

      // Une fois le flux terminé, ajouter les sources si disponibles
      if (sources.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, sources }
            : msg
        ));
      }

      setIsLoading(false);

    } catch (error) {
      console.error("Erreur réseau ou parsing :", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              content: `Erreur réseau : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
            }
          : msg
      ));
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[600px] flex flex-col max-w-3xl mx-auto">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#A100FF] rounded-full">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-gray-900">
            {chatType === "rag" ? "Assistant RAG" : "Agent Infra"}
          </span>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600">En ligne</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Message d'accueil initial */}
          <div className="flex">
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-gray-100">
                <Bot className="h-4 w-4 text-[#A100FF]" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-3 max-w-xl shadow-sm">
                <p className="text-sm">Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
              </div>
            </div>
          </div>

          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`flex items-start space-x-2 max-w-xl ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <div className={`p-2 rounded-full ${message.role === "user" ? "bg-[#A100FF]" : "bg-gray-100"}`}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-[#A100FF]" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-[#A100FF] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
              
              {/* Afficher les sources séparément */}
              {message.sources && message.sources.length > 0 && (
                <div className="flex mb-4">
                  <div className="flex items-start space-x-2">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Bot className="h-4 w-4 text-[#A100FF]" />
                    </div>
                    <div className="bg-gray-200 rounded-xl p-3 max-w-xl shadow-sm">
                      <p className="text-sm">Sources: {message.sources.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-gray-100">
                  <Bot className="h-4 w-4 text-[#A100FF]" />
                </div>
                <div className="p-3 rounded-2xl bg-gray-100 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez un message..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#A100FF] focus:border-[#A100FF]"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#A100FF] hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition"
          >
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
};
