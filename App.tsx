import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role, ImagePart } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessage, TypingIndicator } from './components/ChatMessage';
import { geminiService } from './services/geminiService';
import { MediGenieIcon, MenuIcon, PdfIcon, RefreshIcon } from './components/Icons';
import { Sidebar } from './components/Sidebar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './app.css';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const cleanAndParseJson = (text: string): { question: string, options: string[] } | null => {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
    return null;
  }

  const jsonString = text.substring(jsonStart, jsonEnd + 1);

  try {
    const parsed = JSON.parse(jsonString);

    if (parsed.question && typeof parsed.question === 'string' && Array.isArray(parsed.options)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn("Failed to parse extracted JSON string:", error);
    return null;
  }
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);

  const initChat = useCallback(async () => {
    setIsLoading(true);
    try {
      await geminiService.initializeChat();
      setMessages([
        {
          id: 'initial-greeting',
          role: Role.BOT,
          text: "Hello! I'm MediGenie, your personal AI health companion. I'm here to provide clear, confident health guidance. How can I help you today?",
        },
      ]);
    } catch (error) {
      console.error("Initialization failed:", error);
      setMessages([
        {
          id: 'init-error',
          role: Role.SYSTEM,
          text: "Failed to initialize the chat service. Please check your API key and refresh the page.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initChat();
  }, [initChat]);

  useEffect(() => {
    setTimeout(() => {
      chatListRef.current?.scrollTo({
        top: chatListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 100)
  }, [messages, isBotTyping]);

  const handleSendMessage = useCallback(async (text: string, image?: File, isHidden: boolean = false) => {
    if ((!text.trim() && !image) || isLoading) return;

    setIsLoading(true);
    
    let userMessage: Message | null = null;
    if (!isHidden) {
      userMessage = {
        id: `user-${Date.now()}`,
        role: Role.USER,
        text,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
      };
       setMessages(prev => [...prev, userMessage!]);
    }
    
    setIsBotTyping(true);

    try {
      let imagePart: ImagePart | undefined;
      if (image) {
        const base64Data = await fileToBase64(image);
        imagePart = {
          mimeType: image.type,
          data: base64Data,
        };
      }
      
      const responseText = await geminiService.streamResponse(text, imagePart);
      let botResponse: Message;

      const parsedJson = cleanAndParseJson(responseText);

      if (parsedJson) {
        botResponse = {
          id: `bot-${Date.now()}`,
          role: Role.BOT,
          text: parsedJson.question,
          options: parsedJson.options,
          isQuestion: true,
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          role: Role.BOT,
          text: responseText,
        };
      }
      
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `system-${Date.now()}`,
        role: Role.SYSTEM,
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      setIsLoading(false);
      if (userMessage?.imageUrl) {
        URL.revokeObjectURL(userMessage.imageUrl);
      }
    }
  }, [isLoading]);

  const handleLocationRequest = useCallback(() => {
    if (!navigator.geolocation) {
      handleSendMessage("My browser doesn't support geolocation, so I cannot share my location.", undefined, false);
      return;
    }

    const userMessage: Message = { id: `user-${Date.now()}`, role: Role.USER, text: "Yes, help me find a facility." };
    const locatingMessage: Message = { id: `bot-locating-${Date.now()}`, role: Role.BOT, text: "Got it. Finding your location..." };
    setMessages(prev => [...prev, userMessage, locatingMessage]);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationPrompt = `The user has shared their location. Latitude: ${latitude}, Longitude: ${longitude}. Please provide the final advice including nearby medical facilities.`;
        setMessages(prev => prev.filter(m => m.id !== locatingMessage.id));
        handleSendMessage(locationPrompt, undefined, true);
      },
      (error) => {
        const errorPrompt = `The user tried to share their location, but an error occurred: ${error.message}. Please provide final advice without location suggestions and mention that location services failed.`;
        setMessages(prev => prev.filter(m => m.id !== locatingMessage.id));
        handleSendMessage(errorPrompt, undefined, true);
      }
    );
  }, [handleSendMessage]);

  const handleOptionClick = useCallback((optionText: string) => {
    const lastMessage = [...messages].reverse().find(m => m.role === Role.BOT && m.isQuestion);
    const isLocationQuestion = lastMessage?.text.includes("find a nearby medical facility");

    if (optionText.toLowerCase().includes("find a facility") && isLocationQuestion) {
        handleLocationRequest();
    } else {
      handleSendMessage(optionText);
    }
  }, [handleSendMessage, messages, handleLocationRequest]);

  const handleNewChat = useCallback(() => {
    if (window.confirm("Are you sure you want to start a new chat? Your current conversation will be cleared.")) {
      initChat();
    }
  }, [initChat]);

  const handleSaveChatAsPdf = async () => {
    if (!chatListRef.current) return;
    setIsSavingPdf(true);
    try {
      const canvas = await html2canvas(chatListRef.current, {
        backgroundColor: '#f8fafc', // slate-50
        scale: 2,
        useCORS: true,
      });
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProperties = pdf.getImageProperties(data);
      const imgHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(data, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(data, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save('medigenie-chat.pdf');
    } catch (error) {
      console.error("Failed to save PDF:", error);
    } finally {
      setIsSavingPdf(false);
    }
  };


  return (
    <div className="flex h-screen bg-slate-50 text-gray-800 font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 h-screen">
        <header className="bg-slate-50 p-4 border-b border-slate-200 z-10 sticky top-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 md:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                  <MediGenieIcon />
              </div>
              <h1 className="text-lg font-semibold text-center text-slate-700 hidden sm:block">MediGenie AI Assistant</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveChatAsPdf}
              disabled={isSavingPdf}
              className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isSavingPdf ? "Saving PDF..." : "Save chat as PDF"}
              title={isSavingPdf ? "Saving PDF..." : "Save chat as PDF"}
            >
              {isSavingPdf ? <span className="text-sm px-1">Saving...</span> : <PdfIcon />}
            </button>
             <button
              onClick={handleNewChat}
              className="p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
              aria-label="Start new chat"
              title="Start new chat"
            >
              <RefreshIcon />
            </button>
          </div>
        </header>
        <main 
          ref={chatListRef} 
          className="flex-1 overflow-y-auto p-4 md:px-8 space-y-6 md:space-y-8"
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
        >
          {messages.map((msg, index) => (
            <ChatMessage 
              key={msg.id} 
              message={msg}
              onOptionClick={handleOptionClick}
              isLoading={isLoading}
              isLastMessage={index === messages.length - 1}
            />
          ))}
          {isBotTyping && <TypingIndicator />}
        </main>
        <footer className="p-4 bg-slate-50 sticky bottom-0" role="contentinfo">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <p className="text-xs text-slate-500 text-center mt-3 px-2">
              MediGenie is an AI assistant for informational purposes and is not a substitute for professional medical advice.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;