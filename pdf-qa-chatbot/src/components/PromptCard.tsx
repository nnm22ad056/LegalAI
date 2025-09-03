import React from 'react';
import Icon from './icons/Icon';
import { IconType } from '../types';

interface PromptCardProps {
  prompt: string;
  iconType: IconType;
  onClick: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, iconType, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white cursor-pointer hover:bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-left h-full flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-400"
    >
      <p className="text-sm text-gray-700 font-medium">{prompt}</p>
      <div className="self-end mt-4">
        <Icon type={iconType} className="w-5 h-5 text-gray-500" />
      </div>
    </button>
  );
};

export default PromptCard;
