import { NextResponse } from 'next/server';

// Função para obter dados do dashboard de análises
export async function GET(request) {
  try {
    // Obter o token do header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token de acesso requerido' },
        { status: 401 }
      );
    }

    // Fazer chamada à API do backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://crm.kapexia.com.br';
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erro ao obter dados do backend' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao obter dados do dashboard', error: error.message },
      { status: 500 }
    );
  }
}
