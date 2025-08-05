import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AppInfo, RouteName } from '../common/constants';
import { isUserSignedIn } from '../lib/firebase';

import styles from '../styles/Navigation.module.scss';

const Navigation = ({ onToggleTheme }: { onToggleTheme: () => void }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuthButton, setShowAuthButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    isUserSignedIn().then(setIsSignedIn);
    setShowAuthButton(!/\/sign.+$/.test(router.route));
  }, [router]);

  return (
    <nav className={styles.appNav}>
      <h1>
        <a href="/">{AppInfo.name}</a>
      </h1>
      <div className={styles.navLinks}>
        <button onClick={onToggleTheme}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
          </svg>
        </button>
        {showAuthButton && (
          <a href={isSignedIn ? RouteName.signOut : RouteName.signIn}>
            {isSignedIn ? 'Sign Out' : 'Sign In'}
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
