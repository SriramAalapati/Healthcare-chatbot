import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, XIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string, image?: File) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevIsLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      textareaRef.current?.focus();
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Temporarily hide the scrollbar to prevent it from flashing during calculation
      textarea.style.overflowY = 'hidden';
      // Reset the height to 'auto' to get the correct scrollHeight for the current content
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 160; // Corresponds to Tailwind's max-h-40

      if (scrollHeight > maxHeight) {
        // If content is taller than max height, set height to max and show scrollbar
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        // Otherwise, fit the height to the content and keep scrollbar hidden
        textarea.style.height = `${scrollHeight}px`;
      }
    }
  }, [text]);


  const handleSend = () => {
    if ((text.trim() || image) && !isLoading) {
      onSendMessage(text, image?.file);
      setText('');
      setImage(null);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image.preview);
      setImage(null);
       if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="px-1">
      {/* Enhanced wrapper with prominent focus state */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-sky-500/80 transition-all duration-300">
        {image && (
            <div className="p-3">
                <div className="relative inline-block">
                    <img src={image.preview} alt="Image preview" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    {/* Enhanced focus state for remove button */}
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 border-2 border-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500"
                        aria-label="Remove image"
                    >
                        <XIcon />
                    </button>
                </div>
            </div>
        )}
        <div className="flex items-end gap-1 p-2">
            {/* Enhanced focus state and padding */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3.5 text-slate-500 hover:text-sky-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                aria-label="Attach image"
            >
                <PaperclipIcon />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isLoading}
                aria-label="Image uploader"
            />
            {/* Taller by default with more padding */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health question..."
                className="flex-1 bg-transparent text-slate-800 placeholder-slate-500 focus:outline-none resize-none px-2 py-3.5 transition-[height] duration-150 ease-in-out"
                disabled={isLoading}
                rows={1}
                aria-label="Type a health question"
            />
            {/* Larger, more satisfying send button with refined animations */}
            <button
                onClick={handleSend}
                disabled={isLoading || (!text.trim() && !image)}
                className="bg-sky-600 text-white rounded-xl w-12 h-12 flex-shrink-0 flex items-center justify-center shadow-md hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transform transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none"
                aria-label="Send message"
            >
                <SendIcon />
            </button>
        </div>
      </div>
    </div>
  );
};