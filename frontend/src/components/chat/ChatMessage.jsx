import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

const ChatMessage = ({ message, isLast }) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { user } = useAuthStore();

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    // TODO: Send feedback to backend
  };

  const formatTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-secondary-700' 
          : 'bg-gradient-to-br from-primary-500 to-primary-700'
      }`}>
        {isUser ? (
          user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.firstName} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-secondary-800 text-secondary-100 rounded-tl-none'
          }`}
        >
          {/* Message Text */}
          <div className="prose prose-invert max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="mb-0 last:mb-0">
                {line || <br />}
              </p>
            ))}
          </div>

          {/* Sources (for AI messages) */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-secondary-700">
              <p className="text-xs text-secondary-400 mb-2">Sources:</p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-secondary-700 rounded text-secondary-300"
                  >
                    {source.title || source.name || `Source ${index + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Actions & Time */}
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-secondary-500">
            {formatTime(message.createdAt)}
          </span>

          {!isUser && (
            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1 text-secondary-500 hover:text-secondary-300 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Feedback Buttons */}
              <button
                onClick={() => handleFeedback('positive')}
                className={`p-1 transition-colors ${
                  feedback === 'positive'
                    ? 'text-green-400'
                    : 'text-secondary-500 hover:text-secondary-300'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                className={`p-1 transition-colors ${
                  feedback === 'negative'
                    ? 'text-red-400'
                    : 'text-secondary-500 hover:text-secondary-300'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tokens info (for AI messages in dev mode) */}
        {!isUser && message.tokenCount && (
          <span className="text-xs text-secondary-600 mt-1">
            {message.tokenCount.total} tokens
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
