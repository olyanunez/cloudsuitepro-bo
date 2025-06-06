'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-gray-500">Redirigiendo...</span>
    </div>
  );
}
