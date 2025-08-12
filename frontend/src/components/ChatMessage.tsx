import { Element } from 'hast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageData } from '../types/MessageData';
import { MessageSender } from '../types/MessageSender';

import styles from '../styles/Chat.module.scss';

const ChatMessage = ({ message }: { message: MessageData }) => {
  if (message.sender === MessageSender.USER) {
    return (
    <div className={styles.userMessage}>
      {message.content}
    </div>
    );
  }

  // List item elements (`<li>`) with block content appear with too much spacing,
  // therefore they need to be identified and styled differently.
  const blockTagNames = ['ol', 'p', 'ul'];

  return (
    <div className={styles.aiMessage}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, node, ...props }) => (
            <a {...props} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          ),
          li: ({ children, node, ...props }) => (
            <li
              className={hasChildrenWithTagNames(node, blockTagNames) ? styles.blockContent : ''}
              {...props}
            >
              {children}
            </li>
          )
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
}

function hasChildrenWithTagNames(node: Element | undefined, tagNames: Array<string>): boolean {
  return node?.children.some(x => 'tagName' in x && tagNames.includes(x.tagName)) ?? false;
}

export default ChatMessage;
