import React, { useState, useEffect, useRef } from 'react';
import Icon from './icons/Icon';
import { IconType, ChatSession } from '../types';
import { Orb, oceanDepthsPreset } from "react-ai-orb";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  chats, 
  activeChatId, 
  onNewChat, 
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRenameStart = (chat: ChatSession) => {
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
    setMenuOpenFor(null);
  };
  
  const handleRenameSubmit = () => {
    if (renamingChatId && renameValue.trim()) {
      onRenameChat(renamingChatId, renameValue.trim());
    }
    setRenamingChatId(null);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0">
         <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-start'}`}>
            <Icon type={IconType.Logo} className="w-8 h-8 text-gray-800" />
         </div>
      </div>
      
      <div className="flex flex-col flex-1 p-3 overflow-y-hidden">
<button
  onClick={onNewChat}
  aria-label="New Chat"
  className={`w-full flex items-center h-11 px-3.5 rounded-lg cursor-pointer text-white 
    bg-gradient-to-r from-[#302F32] to-[#0E141C] 
    hover:from-[#1F2229] hover:to-[#0E141C] hover:bg-gradient-to-r
    transition-colors duration-200 
    ${isCollapsed ? 'justify-center' : ''}
  `}
>
  <Icon type={IconType.Plus} className="w-6 h-6 flex-shrink-0" />
  {!isCollapsed && (
    <span className="ml-3 font-medium text-sm whitespace-nowrap truncate">
      New Chat
    </span>
  )}
</button>

        {!isCollapsed && (
          <div className="relative my-2">
            <Icon type={IconType.Search} className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              aria-label="Search history"
            />
          </div>
        )}
        
        <nav className="flex-1 space-y-1 overflow-y-auto mt-2 -mr-2 pr-2">
          {filteredChats.map(chat => (
            <div key={chat.id} className="relative group">
              {renamingChatId === chat.id ? (
                 <div className="flex items-center h-11 px-3.5">
                    <Icon type={IconType.Chat} className="w-6 h-6 flex-shrink-0 text-blue-600 mr-3" />
                    <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit()}}
                        className="w-full bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded -ml-1 px-1"
                        autoFocus
                    />
                 </div>
              ) : (
                <button
                    onClick={() => onSelectChat(chat.id)}
                    aria-label={chat.title}
                    className={`w-full flex items-center h-11 px-3.5 rounded-lg transition-colors duration-200 text-left ${
                    chat.id === activeChatId ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <Icon type={IconType.Chat} className="w-6 h-6 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-medium text-sm whitespace-nowrap truncate">{chat.title}</span>}
                </button>
              )}
              {!isCollapsed && renamingChatId !== chat.id && (
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setMenuOpenFor(menuOpenFor === chat.id ? null : chat.id)} className="p-1.5 rounded-md hover:bg-gray-200">
                        <Icon type={IconType.EllipsisVertical} className="w-5 h-5 text-gray-500" />
                    </button>
                 </div>
              )}
              {menuOpenFor === chat.id && (
                <div ref={menuRef} className="absolute z-10 right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                    <button onClick={() => handleRenameStart(chat)} className="w-full text-left flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                        <Icon type={IconType.Pencil} className="w-4 h-4 mr-2.5" />
                        Rename
                    </button>
                    <button onClick={() => onDeleteChat(chat.id)} className="w-full text-left flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                        <Icon type={IconType.Trash} className="w-4 h-4 mr-2.5" />
                        Delete
                    </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onToggle}
          className={`w-full cursor-pointer flex items-center h-11 px-3.5 rounded-lg text-gray-600 hover:bg-gray-100 ${isCollapsed ? 'justify-center' : ''}`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            type={IconType.ChevronLeft}
            className={`w-6 h-6 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
           {!isCollapsed && <span className="ml-3 font-medium text-sm whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
