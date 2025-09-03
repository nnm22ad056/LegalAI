"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

import { ChatSession, Message } from '@/types';
import { askBackend, generateChatTitle, uploadPdf } from '@/services/backendService';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const Home: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Effect to initialize the first chat session on load
  useEffect(() => {
    if (chats.length === 0) {
      handleNewChat();
    }
  }, []);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: uuidv4(), // Use uuid for unique IDs
      title: 'New Chat',
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };
  
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const handleDeleteChat = (chatId: string) => {
    const remainingChats = chats.filter(chat => chat.id !== chatId);
    setChats(remainingChats);

    if (activeChatId === chatId) {
      if (remainingChats.length > 0) {
        // Select the newest remaining chat
        setActiveChatId(remainingChats[0].id);
      } else {
        // Create a new one if all are deleted
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async (prompt: string) => {
    if (!activeChatId) return;

    const userMessage: Message = { sender: 'user', text: prompt };
    
    const activeChatBeforeUpdate = chats.find(c => c.id === activeChatId);
    const isFirstMessage = activeChatBeforeUpdate && activeChatBeforeUpdate.messages.length === 0;
    const currentCollectionName = activeChatBeforeUpdate?.collectionName; // Get collection name from active chat

    // Determine query type based on whether a collection is active
    const queryType = currentCollectionName ? 'rag' : 'direct';

    // Show user message and a thinking indicator immediately
    const thinkingMessage: Message = { sender: 'ai', text: '...' };
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage, thinkingMessage] }
          : chat
      )
    );

    try {
      // Fetch AI response and generate title in parallel if needed
      const responsePromise = askBackend(prompt, queryType, currentCollectionName);
      const titlePromise = isFirstMessage ? generateChatTitle(prompt) : Promise.resolve(null);
      
      const [backendResponse, newTitle] = await Promise.all([responsePromise, titlePromise]);
      
      const aiMessage: Message = { sender: 'ai', text: backendResponse.answer, sources: backendResponse.sources };

      // Replace thinking indicator with actual response and update title
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.slice(0, -1).concat(aiMessage);
            const updatedChat = {
               ...chat, 
               messages: updatedMessages,
               ...(newTitle && { title: newTitle }),
            };
            return updatedChat;
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error sending message to backend:", error);
      // Replace thinking indicator with an error message
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === activeChatId) {
            const errorMessage: Message = { sender: 'ai', text: `Error: Failed to get response from backend. ${error instanceof Error ? error.message : String(error)}` };
            const updatedMessages = chat.messages.slice(0, -1).concat(errorMessage);
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );
    }
  };

  const handleUploadPdf = async (file: File) => {
    if (!activeChatId) {
      // If no active chat, create a new one first
      handleNewChat();
      // This will trigger a re-render, so we need to ensure the upload happens after the new chat is active.
      // For simplicity, we'll re-call this function after a short delay or refactor to use a state for pending uploads.
      // For now, let's assume activeChatId will be set by handleNewChat and the user will re-attempt.
      // A more robust solution would involve a loading state and queuing the upload.
      alert("Please select a chat or start a new one before uploading a PDF.");
      return;
    }

    const loadingMessage: Message = { sender: 'ai', text: 'Uploading and processing PDF...' };
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, loadingMessage] }
          : chat
      )
    );

    try {
      const { collection_name } = await uploadPdf(file);
      const successMessage: Message = { sender: 'ai', text: `PDF "${file.name}" processed successfully. You can now ask questions about it.` };
      
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.slice(0, -1).concat(successMessage);
            return { ...chat, messages: updatedMessages, collectionName: collection_name };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      const errorMessage: Message = { sender: 'ai', text: `Error: Failed to upload PDF. ${error instanceof Error ? error.message : String(error)}` };
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.slice(0, -1).concat(errorMessage);
            return { ...chat, messages: updatedMessages };
          }
          return chat;
        })
      );
    }
  };

  const activeChat = chats.find(chat => chat.id === activeChatId);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1 flex flex-col">
        <MainContent 
          key={activeChatId}
          messages={activeChat ? activeChat.messages : []}
          onSendMessage={handleSendMessage}
          onUploadPdf={handleUploadPdf}
        />
      </div>
    </div>
  );
};

export default Home;
