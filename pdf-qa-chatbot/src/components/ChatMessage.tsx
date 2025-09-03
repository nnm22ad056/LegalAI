import React from 'react';
import { IconType, Message } from '../types';
import Icon from './icons/Icon';
import { Orb, oceanDepthsPreset } from "react-ai-orb";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex w-full py-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex items-end gap-4 max-w-3xl">
        <div
          className={`rounded-2xl ${
            isUser
              ? 'bg-white text-gray-800 shadow-xs border py-3 px-4 '
              : 'bg-transparent text-gray-800 '
          }`}
        >
          {message.text === '...' && !isUser ? (
            <div className="ml-6 mb-2 loader bg-violet-600"></div>
          ) : (
            <p className="text-base whitespace-pre-wrap">{message.text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
