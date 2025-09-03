import React, { useState, useRef, useEffect } from 'react';
import Icon from './icons/Icon';
import { IconType } from '../types';

interface ChatInputProps {
  onSend: (prompt: string) => void;
  onUploadPdf: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onUploadPdf }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [prompt]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    onSend(prompt);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadPdf(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white border border-gray-200/80 rounded-2xl shadow-sm transition-all duration-300 ">
      <div className="flex items-end p-2 space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 flex items-center cursor-pointer justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Attach file"
        >
          <Icon type={IconType.Paperclip} className="w-5 h-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI a legal question or make a law-related request..."
          className="flex-1 w-full bg-transparent text-gray-800 placeholder-gray-500 resize-none focus:outline-none py-2 px-2 max-h-48 text-base"
          rows={1}
        />
<button
  onClick={handleSend}
  disabled={!prompt.trim()}
  className={`
    flex-shrink-0 w-10 h-10 flex items-center justify-center 
    font-bold text-white rounded-full
    bg-gradient-to-r from-[#302F32] to-[#0E141C]
    transition-colors duration-300 ease-in-out
    

    enabled:hover:bg-gradient-to-r 
    enabled:hover:from-[#1F2229] 
    enabled:hover:to-[#0E141C]
    enabled:hover:cursor-pointer

    disabled:bg-[#838792]
    disabled:from-none disabled:to-none
    disabled:bg-none
    disabled:cursor-not-allowed
  `}
  aria-label="Send message"
>
  <Icon type={IconType.ArrowUp} className="w-5 h-5" />
</button>



      </div>
    </div>
  );
};

export default ChatInput;
