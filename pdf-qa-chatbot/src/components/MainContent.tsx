import React from 'react';
import ChatInput from './ChatInput';
import PromptCard from './PromptCard';
import ChatMessageList from './ChatMessageList';
import { IconType, Message } from '../types';
import { Orb, oceanDepthsPreset } from "react-ai-orb";

interface MainContentProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  onUploadPdf: (file: File) => void;
}

const MainContent: React.FC<MainContentProps> = ({ messages, onSendMessage, onUploadPdf }) => {
  const examplePrompts = [
    { text: 'Explain the structure of the Indian judiciary.', icon: IconType.Comment },
    { text: 'Draft an email reply to a client rejecting a legal service offer, politely.', icon: IconType.Envelope },
    { text: 'Summarize the key features of the Indian Constitution.', icon: IconType.Comment },
    { text: 'Provide a one-paragraph summary of the Right to Education Act.', icon: IconType.Envelope },
  ];

  return (
    <main className="flex-1 flex flex-col relative overflow-y-hidden">
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto pb-4 overflow-y-hidden">
        {messages.length === 0 ? (
          // Welcome View
          <div className="flex flex-col items-center justify-center flex-1 px-6">
            <div className="relative mb-8">
              <div>
                <Orb {...oceanDepthsPreset} />
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-light text-gray-800">Hello!</h1>
              <h2 className="text-4xl md:text-5xl font-light">
                How Can I {' '}
                <span className="bg-gradient-to-r font-bold from-[#5CC8EF] to-[#112A8D] bg-clip-text text-transparent">
                  Assist You Today?
                </span>
              </h2>
            </div>

            <div className="w-full mt-12">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Get started with an example below
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
                {examplePrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.text}
                    prompt={prompt.text}
                    iconType={prompt.icon}
                    onClick={() => onSendMessage(prompt.text)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat View
          <ChatMessageList messages={messages} />
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 pb-4">
        <ChatInput onSend={onSendMessage} onUploadPdf={onUploadPdf} />
      </div>
    </main>
  );
};

export default MainContent;
