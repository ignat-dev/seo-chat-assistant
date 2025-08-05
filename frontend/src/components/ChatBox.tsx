import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import styles from '../styles/Chat.module.scss';

export interface ChatBoxApi {
  focus: () => void;
}

interface ChatBoxProps {
  loading: boolean;
  placeholder: string;
  value: string;
  onInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

const ChatBox = forwardRef<ChatBoxApi, ChatBoxProps>(
  ({ loading, placeholder, value, onInput, onSubmit }, ref) => {
    const TEXTAREA_MAX_HEIGHT = 300; // in pixels, about 10 rows

    const isValueEmpty = useMemo<boolean>(() => !value.trim(), [value]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Expose API methods to parent.
    useImperativeHandle(ref, () => ({ focus: focusTextarea }));

    const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
      const textarea = e.target as HTMLTextAreaElement;
      // Emit the newly entered value.
      onInput(textarea.value);
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
        onSubmit();
      }
    };

    return (
      <form className={styles.chatBox} onSubmit={onSubmit}>
        <textarea
          autoFocus={true}
          disabled={loading}
          placeholder={placeholder}
          ref={textareaRef}
          rows={2}
          value={value}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <button
          aria-busy={loading && !isValueEmpty}
          disabled={loading || isValueEmpty}
          type="submit"
        >
          <span>➜</span>
        </button>
      </form>
    );
  }
);

export default ChatBox;
