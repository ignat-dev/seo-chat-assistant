import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { RouteName, AppInfo } from '../common/constants';
import { firebaseApp } from '../lib/firebase';

import styles from '../styles/AuthForm.module.scss';

const AuthForm = ({ mode }: { mode: 'signin' | 'signup' }) => {
  const auth = getAuth(firebaseApp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const isSignIn = mode === 'signin';
  const router = useRouter();

  const isPasswordValid = useMemo(
    () => password && (isSignIn || password.length >= 8),
    [password]
  );

  const showPasswordError = useMemo(
    () => password && !isPasswordValid,
    [password]
  );

  const isRepeatPasswordValid = useMemo(
    () => isSignIn || (repeatPassword && repeatPassword === password),
    [repeatPassword]
  );

  const showRepeatPasswordError = useMemo(
    () => !isSignIn && repeatPassword && !isRepeatPasswordValid,
    [repeatPassword]
  );

  const isFormValid = useMemo(() => {
    if (isSignIn) {
      return Boolean(email && password);
    }

    return email.length > 5 && isPasswordValid && isRepeatPasswordValid;
  }, [email, isPasswordValid, isRepeatPasswordValid, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      await (
        isSignIn
          ? signInWithEmailAndPassword(auth, email, password)
          : createUserWithEmailAndPassword(auth, email, password)
      );
      router.push(isSignIn ? RouteName.chat : RouteName.signIn);
    } catch (ex) {
      // TODO: Display the error to the user.
      console.error(ex);
    }
  };

  return (
    <div className={styles.authFormWrapper}>
      <h2>{isSignIn ? 'Sign in' : 'Sign up'}</h2>
      <p>
        {isSignIn ? 'to continue to' : 'to start using'}{' '}
        <strong>{AppInfo.name}</strong>
      </p>

      <form className={styles.authForm} onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          aria-describedby={isSignIn ? undefined : 'invalid-password'}
          aria-invalid={isSignIn ? undefined : showPasswordError}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {showPasswordError && (
          <small id="invalid-password">
            Password must contain at least 8 characters.
          </small>
        )}
        {!isSignIn && (
          <>
            <input
              aria-describedby="invalid-repeat-password"
              aria-invalid={showRepeatPasswordError}
              placeholder="Repeat password"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            {showRepeatPasswordError && (
              <small id="invalid-repeat-password">
                Passwords don't match.
              </small>
            )}
          </>
        )}
        <button disabled={!isFormValid} type="submit">
          {isSignIn ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <a href={isSignIn ? RouteName.signUp : RouteName.signIn}>
        {isSignIn ? 'Need an account? Sign up.' : 'Already have an account? Sign in.'}
      </a>
    </div>
  );
};

export default AuthForm;
