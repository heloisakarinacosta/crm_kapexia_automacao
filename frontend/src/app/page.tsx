"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">A redirecionar para a página de login...</p>
      {/* Pode adicionar um spinner ou um indicador de carregamento aqui */}
    </div>
  );
}

