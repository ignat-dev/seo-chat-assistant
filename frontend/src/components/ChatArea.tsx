import { useState, useRef, useEffect } from 'react';
import { MessageData } from '../types';
import ChatMessage from './ChatMessage';

import styles from '../styles/Chat.module.scss';

interface ChatAreaProps {
  loading: boolean;
  messages: Array<MessageData>;
}

const ChatArea = ({ loading, messages }: ChatAreaProps) => {
  const [scrollBehavior, setScrollBehavior] = useState<ScrollBehavior>('auto');
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: scrollBehavior });
    });

    // Use auto scroll initially, to jump to the end of the conversation,
    // and smooth scrolling later, when displaying new messages.
    if (scrollBehavior === 'auto') {
      setScrollBehavior('smooth');
    }
  }, [loading, messages]);

  return (
    <div className={styles.chatArea}>
      <div className={styles.messageList}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {loading && (
          <div className={styles.loadingIndicator}>
            {messages.length ? 'AI is thinking...' : 'Loading, please wait...'}
          </div>
        )}
        <div ref={scrollAnchorRef} className={styles.scrollAnchor}>&nbsp;</div>
      </div>
    </div>
  );
};

export default ChatArea;
