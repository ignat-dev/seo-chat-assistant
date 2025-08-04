import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { RouteName } from '../common/constants';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => { router.replace(RouteName.signIn) }, [router]);

  return null; // nothing to render, it will redirect
}
