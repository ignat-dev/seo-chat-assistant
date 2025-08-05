import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { firebaseAuth } from '../lib/firebase';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut(firebaseAuth).then(() => router.replace('/'));
  }, [router]);

  return null; // nothing to render, it will redirect
}
