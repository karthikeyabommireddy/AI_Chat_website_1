import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, Loader2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, placeholder = 'Type a message...' }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  return (
    <div className="border-t border-secondary-800 bg-secondary-900/50 px-4 py-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2 bg-secondary-800 rounded-2xl border border-secondary-700 focus-within:border-primary-500 transition-colors">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-secondary-400 hover:text-secondary-300 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none py-3 pr-2 text-white placeholder-secondary-500 max-h-[200px]"
          />

          {/* Right Side Buttons */}
          <div className="flex items-center gap-1 pr-2 pb-2">
            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'text-secondary-400 hover:text-secondary-300 hover:bg-secondary-700'
              }`}
              title={isRecording ? 'Stop recording' : 'Voice message'}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2 rounded-lg transition-all ${
                message.trim() && !disabled
                  ? 'bg-primary-600 text-white hover:bg-primary-500'
                  : 'text-secondary-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {disabled ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-center text-xs text-secondary-500">
          Press <kbd className="px-1.5 py-0.5 bg-secondary-800 rounded text-secondary-400">Enter</kbd> to send, 
          <kbd className="px-1.5 py-0.5 bg-secondary-800 rounded text-secondary-400 ml-1">Shift + Enter</kbd> for new line
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
