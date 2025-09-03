import React, { useEffect, useRef } from "react";

interface Source {
  content: string;
  page: string;
}

interface Message {
  type: "user" | "ai";
  text: string;
  sources?: Source[];
}

interface ChatPanelProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  collectionName: string | null;
}

interface UserMessageProps {
  message: string;
}

interface AIMessageProps {
  message: string;
  sources: Source[];
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="flex justify-end mb-4">
    <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs sm:max-w-md break-words">
      {message}
    </div>
  </div>
);

const AIMessage: React.FC<AIMessageProps> = ({ message, sources }) => (
  <div className="flex justify-start mb-4">
    <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs sm:max-w-md break-words dark:bg-gray-700 dark:text-gray-200">
      {message}
      {sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sources:</h4>
          <div className="grid gap-2">
            {sources.map((source, index) => (
              <div key={index} className="p-2 bg-gray-100 dark:bg-gray-600 rounded-md text-xs text-gray-600 dark:text-gray-400 italic">
                Page {source.page}: {source.content.substring(0, 150)}...
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export function ChatPanel({ messages, loading, error, collectionName }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 ">
      {collectionName && (
        <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-700 mb-4 text-sm flex items-center justify-between">
          <span>
            Document loaded: <span className="font-semibold">{collectionName}</span>
          </span>
          {/* Potentially add an option to clear the document */}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-700 mb-4 text-sm">
          Error: {error}
        </div>
      )}

      <div className="flex-grow overflow-y-auto pr-2">
        {messages.map((msg, index) => {
          if (msg.type === "user") {
            return <UserMessage key={index} message={msg.text} />;
          } else {
            return <AIMessage key={index} message={msg.text} sources={msg.sources || []} />;
          }
        })}
        {loading && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-300"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-300 text-sm">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
