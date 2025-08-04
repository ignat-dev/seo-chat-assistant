import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

import styles from '../styles/Chat.module.scss';

// TODO: Refactor and split into smaller components.

const Chat = () => {
  const TEXTAREA_MAX_HEIGHT = 300; // in pixels, about 10 rows

  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [scrollBehavior, setScrollBehavior] = useState<ScrollBehavior>('auto');
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    api.get<{ messages: Array<{ sender: string; content: string }> }>('/messages')
      .then(({ messages }) => {
        setMessages(messages);
        focusTextarea();
      })
      .catch((ex) => {
        console.error('Error loading messages:', ex);
        setError(ex.message ?? ex);
      })
      .finally(() =>{
        setLoading(false);
      });
  }, []);

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

  // Sometimes the text area is disabled and can't be focused immediately,
  // therefore retry until it's possible.
  const focusTextarea = () => {
    const textarea =  textareaRef.current;

    if (textarea && !textarea.disabled && document.activeElement !== textarea) {
      textarea.focus();
    } else {
      setTimeout(focusTextarea, 500);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    const message = input.trim();

    e?.preventDefault();

    if (!message) {
      return;
    }

    try {
      setLoading(true);

      // Append the user message immediately, for better UX.
      setMessages((prev) => [...prev, { sender: 'user', content: message }]);
      setInput('');
      focusTextarea();

      const { response } = await api.post<{ response: string }>('/messages', { message });

      setMessages((prev) => [...prev, { sender: 'ai', content: response }]);
    } catch (ex) {
      console.error('Error submitting message:', ex);
      setError(ex.message ?? ex)
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
    setInput((e.target as HTMLTextAreaElement).value);

    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    // Reset the height to allow shrinking when rows are deleted.
    textarea.style.height = 'auto';
    // Increase the height when more than initial rows are added.
    textarea.style.height = `${Math.min(TEXTAREA_MAX_HEIGHT, textarea.scrollHeight)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      // Prevent insertion of a new line.
      e.preventDefault();
      // Trigger the submit functionality.
      handleSubmit();
    }
  };

  const handleModalClose = () => {
    setError('');
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.messageListWrapper}>
        <div className={styles.messageList}>
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'user' ? styles.userMessage : ''}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className={styles.loadingIndicator}>
              {messages.length ? 'AI is thinking...' : 'Loading, please wait...'}
            </div>
          )}
          <div ref={scrollAnchorRef} className={styles.scrollAnchor}>&nbsp;</div>
        </div>
      </div>

      <form className={styles.inputBox} onSubmit={handleSubmit}>
        <textarea
          autoFocus={true}
          disabled={loading}
          placeholder="Enter title on the first line, and content below... (Ctrl+Enter to submit)"
          ref={textareaRef}
          rows={2}
          value={input}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <button
          aria-busy={loading && !!input.trim()}
          disabled={loading || !input.trim()}
          type="submit"
        >
          <span>➜</span>
        </button>
      </form>

      <dialog className={styles.chatModal} open={!!error}>
        <article>
          <header>
            <strong>⚠ Unexpected error occured!</strong>
            <button aria-label="Close" rel="prev" onClick={handleModalClose}></button>
          </header>
          <p>
            {error}
          </p>
          <footer>
            <button className="secondary" onClick={handleModalClose}>
              Close
            </button>
          </footer>
        </article>
      </dialog>
    </div>
  );
};

export default Chat;
