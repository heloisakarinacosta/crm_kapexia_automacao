"use client";

import React from 'react';

interface SuggestionItem {
  id: string;
  text: string;
  icon?: string;
}

interface ChatSuggestionProps {
  suggestion: SuggestionItem;
  onClick: () => void;
}

const ChatSuggestion: React.FC<ChatSuggestionProps> = ({ suggestion, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg p-4 text-left transition-colors duration-200 w-full"
    >
      <div className="flex items-center">
        {suggestion.icon && <span className="text-xl mr-3">{suggestion.icon}</span>}
        <span>{suggestion.text}</span>
      </div>
    </button>
  );
};

export default ChatSuggestion;
