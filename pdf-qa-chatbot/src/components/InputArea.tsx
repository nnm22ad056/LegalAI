import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";

interface InputAreaProps {
  question: string;
  setQuestion: (question: string) => void;
  handleSubmit: (event: React.FormEvent) => void;
  loading: boolean;
  collectionName: string | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: () => void;
  file: File | null;
  uploadLoading: boolean;
  uploadError: string | null;
  onClearFile: () => void;
}

export function InputArea({
  question,
  setQuestion,
  handleSubmit,
  loading,
  collectionName,
  handleFileChange,
  handleFileUpload,
  file,
  uploadLoading,
  uploadError,
  onClearFile,
}: InputAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to trigger hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Auto-expand textarea as user types
  const onQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, 120); // Max height ~5 rows
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  };

  // Clear file input
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClearFile();
  };

  // Reset textarea height when message is cleared
  useEffect(() => {
    if (question === "" && textareaRef.current) {
      textareaRef.current.style.height = "48px"; // Reset to 1 row
    }
  }, [question]);

  return (
    <div className="flex flex-col w-full max-w-3xl">
      {file && (
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 mb-2 border border-gray-200 dark:border-gray-600">
          <span className="flex items-center">
            <Paperclip className="h-4 w-4 mr-2" />
            Selected file: <span className="font-semibold ml-1">{file.name}</span>
          </span>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleFileUpload}
              disabled={uploadLoading}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadLoading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              onClick={handleClearFile}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700 mb-2">
          Error: {uploadError}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim()) return;
          handleSubmit(e);
        }}
        className="flex w-full gap-2 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <Button
          type="button"
          onClick={triggerFileInput}
          variant="outline"
          size="icon"
          className="flex-shrink-0 h-10 w-10"
          title="Upload PDF document"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={question}
          onChange={onQuestionChange}
          placeholder={
            collectionName
              ? "Ask a question about the document or a general query..."
              : "Ask a general query..."
          }
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none overflow-y-auto min-h-[48px] max-h-[120px]"
          disabled={loading}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <Button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex-shrink-0 h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
