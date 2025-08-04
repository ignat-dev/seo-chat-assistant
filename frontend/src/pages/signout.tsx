import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../lib/firebase';

export default function SignOutPage() {
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  useEffect(() => {
    signOut(auth).then(() => router.replace('/'));
  }, [router]);

  return null; // nothing to render, it will redirect
}
