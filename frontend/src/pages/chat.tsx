import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RouteName } from '../common/constants';
import Chat from '../components/Chat';
import { isUserSignedIn } from '../lib/firebase';

export default function ChatPage() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    isUserSignedIn().then(setIsSignedIn);
  }, []);

  useEffect(() => {
    if (isSignedIn === false) {
      router.replace(RouteName.signIn);
    }
  }, [isSignedIn, router]);

  return isSignedIn ? <Chat /> : null;
}
