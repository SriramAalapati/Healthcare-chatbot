import React, { useRef } from 'react';
import { Message, Role } from '../types';
import { MediGenieIcon, UserIcon, SystemIcon, ThumbsUpIcon, ThumbsDownIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  onOptionClick?: (option: string) => void;
  isLoading?: boolean;
  isLastMessage?: boolean;
}

export const TypingIndicator: React.FC = () => (
    <div className="flex items-start gap-3.5 justify-start">
        <div className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm bg-teal-100 text-teal-600">
            <MediGenieIcon />
        </div>
        <div className="bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-200 shadow-sm w-fit">
            <div className="flex items-center space-x-1.5 py-3 px-4">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);

const FormattedText: React.FC<{ text: string }> = React.memo(({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return (
        <p className="whitespace-pre-wrap leading-relaxed text-base">
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
                }
                const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                if (linkMatch) {
                    const linkText = linkMatch[1];
                    const linkUrl = linkMatch[2];
                    return (
                        <a
                            key={i}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline font-medium"
                        >
                            {linkText}
                        </a>
                    );
                }
                return part;
            })}
        </p>
    );
});

interface ParsedSection {
  title: string;
  content: string;
}

const parseBotResponse = (text: string): { intro: string; sections: ParsedSection[]; outro: string } | null => {
    const sectionMarker = /\n\s*\d+\.\s+\*\*(.*?):\*\*/;
    if (!text.match(sectionMarker)) {
        return null;
    }

    const sections: ParsedSection[] = [];
    let remainingText = text;
    
    const introMatch = remainingText.match(new RegExp(`^(.*?)(?=${sectionMarker.source})`, 's'));
    let intro = '';
    if (introMatch) {
        intro = introMatch[1].trim();
        remainingText = remainingText.substring(introMatch[0].length);
    }

    const parts = remainingText.split(/\n\s*(?=\d+\.\s+\*\*(.*?):\*\*)/g).filter(p => p.trim());
    let outro = '';
    
    parts.forEach((part) => {
        const titleMatch = part.match(/^\d+\.\s+\*\*(.*?):\*\*/);
        if (titleMatch) {
            const title = titleMatch[1];
            const content = part.substring(titleMatch[0].length).trim();
            if (title && content) {
                sections.push({ title, content });
            }
        }
    });
    
    const lastSectionText = sections.length > 0 ? `**${sections[sections.length - 1].title}:**${sections[sections.length - 1].content}` : '';
    const lastSectionFullMarker = text.lastIndexOf(lastSectionText)
    if (lastSectionFullMarker > -1) {
        const outroIndex = lastSectionFullMarker + lastSectionText.length;
        const potentialOutro = text.substring(outroIndex).trim();

        if (potentialOutro && !potentialOutro.match(sectionMarker)) {
            outro = potentialOutro;
        }
    }

    return { intro, sections, outro };
};


const ParsedBotMessage: React.FC<{ text: string }> = ({ text }) => {
    const parsedData = parseBotResponse(text);

    if (!parsedData || parsedData.sections.length === 0) {
        return <FormattedText text={text} />;
    }
    
    const { intro, sections, outro } = parsedData;

    return (
        <div className="space-y-4">
            {intro && <p className="text-slate-700 text-base"><FormattedText text={intro} /></p>}
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <div key={index}>
                        <h3 className="font-semibold text-slate-800 text-base">
                            {section.title}
                        </h3>
                        <div className="text-slate-600 mt-1 pl-1 border-l-2 border-slate-200 ml-1">
                          <div className="pl-3">
                            <FormattedText text={section.content} />
                          </div>
                        </div>
                    </div>
                ))}
            </div>
            {outro && <div className="mt-4 text-slate-700 italic"><FormattedText text={outro} /></div>}
        </div>
    );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick, isLoading, isLastMessage }) => {
  const { role, text, imageUrl, isQuestion, options } = message;
  const messageRef = useRef<HTMLDivElement>(null);

  const isUser = role === Role.USER;
  const isBot = role === Role.BOT;
  const isSystem = role === Role.SYSTEM;

  const wrapperClasses = `flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`;
  
  const messageContainerClasses = `max-w-xl lg:max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`;

  const isStructuredBotMessage = isBot && text && !!parseBotResponse(text);

  const messageBubbleClasses = `w-fit shadow-sm px-4 py-3 ${
    isUser
      ? 'bg-sky-600 text-white rounded-2xl rounded-br-md'
      : isBot
      ? 'bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-200'
      : 'bg-slate-200 text-slate-600'
  } ${isStructuredBotMessage ? 'p-5' : ''}`;

  const iconClasses = 'w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm';

  const icon = isUser ? (
    <div className={`${iconClasses} bg-sky-100 text-sky-600`}>
      <UserIcon />
    </div>
  ) : isBot ? (
    <div className={`${iconClasses} bg-teal-100 text-teal-600`}>
      <MediGenieIcon />
    </div>
  ) : (
     <div className={`${iconClasses} bg-red-100 text-red-600`}>
      <SystemIcon />
    </div>
  );

  if (isSystem) {
      return (
          <div className="flex justify-center">
              <div className="bg-slate-200 text-slate-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <SystemIcon/>
                  <p>{text}</p>
              </div>
          </div>
      )
  }

  return (
    <div className={wrapperClasses}>
      {!isUser && icon}
      <div className={messageContainerClasses}>
          <div className={messageBubbleClasses}>
             <div ref={messageRef}>
                {imageUrl && (
                    <img 
                        src={imageUrl} 
                        alt="User upload" 
                        className="max-w-xs rounded-lg mb-2 border border-slate-200"
                    />
                )}
                {text && (isBot ? <ParsedBotMessage text={text}/> : <FormattedText text={text}/>)}
             </div>
          </div>

          {isQuestion && options && (
            <div className="flex flex-wrap gap-2.5 mt-3 pl-1">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onOptionClick?.(option)}
                  disabled={isLoading || !isLastMessage}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
                  aria-label={`Select option: ${option}`}
                >
                  {option}
                </button>
              ))}
            </div>
           )}

           {isStructuredBotMessage && (
                <div className="flex items-center gap-4 mt-3 ml-2">
                    <span className="text-xs text-slate-500">Was this helpful?</span>
                    <div className="h-4 border-l border-slate-300"></div>
                    <button className="text-slate-400 hover:text-teal-600 transition-colors p-1 rounded-full" aria-label="Good response">
                        <ThumbsUpIcon />
                    </button>
                    <button className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full" aria-label="Bad response">
                        <ThumbsDownIcon />
                    </button>
                </div>
            )}
      </div>
      {isUser && icon}
    </div>
  );
};