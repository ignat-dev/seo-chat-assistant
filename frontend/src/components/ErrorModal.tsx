import styles from '../styles/ErrorModal.module.scss';

const ErrorModal = ({ error, onClose }: { error: Error | string, onClose: () => void }) => {
  return (
    <dialog className={styles.errorModal} open={!!error}>
      <article>
        <header>
          <strong>⚠ Unexpected error occured!</strong>
          <button aria-label="Close" rel="prev" onClick={onClose}></button>
        </header>
        <p>
          {error instanceof Error ? error.message : error}
        </p>
        <footer>
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </article>
    </dialog>
  );
};

export default ErrorModal;
