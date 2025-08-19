import { NextResponse } from 'next/server';

// Função para obter dados de um gráfico específico
export async function GET(request, { params }) {
  try {
    const { position } = params;
    
    // Em produção, esta função fará uma chamada à API do backend
    // const response = await fetch(`${process.env.BACKEND_URL}/api/analytics/chart/${position}`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}` // Token obtido do cookie ou localStorage
    //   }
    // });
    // const data = await response.json();
    // return NextResponse.json(data);

    // Dados de exemplo para desenvolvimento
    let chartData;
    let chartTitle;
    let chartSubtitle;
    let chartType;
    
    switch (position) {
      case '1':
        chartTitle = 'KAPEX QUALIFICAÇÃO';
        chartSubtitle = 'Leads Recebidos';
        chartType = 'column';
        chartData = [
          { dia: 'Seg', valor: 20 },
          { dia: 'Ter', valor: 15 },
          { dia: 'Qua', valor: 25 },
          { dia: 'Qui', valor: 18 },
          { dia: 'Sex', valor: 22 },
          { dia: 'Sáb', valor: 17 },
          { dia: 'Dom', valor: 29 }
        ];
        break;
      case '2':
        chartTitle = 'KAPEX PROSPECÇÃO';
        chartSubtitle = 'Leads Prospectados';
        chartType = 'line';
        chartData = [
          { dia: 'Seg', valor: 15 },
          { dia: 'Ter', valor: 18 },
          { dia: 'Qua', valor: 16 },
          { dia: 'Qui', valor: 22 },
          { dia: 'Sex', valor: 26 },
          { dia: 'Sáb', valor: 24 },
          { dia: 'Dom', valor: 28 }
        ];
        break;
      case '3':
        chartTitle = 'KAPEX EXPANSÃO';
        chartSubtitle = 'Clientes Prospectados';
        chartType = 'column';
        chartData = [
          { dia: 'Seg', valor: 8 },
          { dia: 'Ter', valor: 10 },
          { dia: 'Qua', valor: 12 },
          { dia: 'Qui', valor: 9 },
          { dia: 'Sex', valor: 11 },
          { dia: 'Sáb', valor: 10 },
          { dia: 'Dom', valor: 14 }
        ];
        break;
      case '4':
        chartTitle = 'DISTRIBUIÇÃO QUALIFICAÇÃO';
        chartType = 'pie';
        chartData = [
          { nome: 'Frio', valor: 30 },
          { nome: 'Morno', valor: 45 },
          { nome: 'Quente', valor: 25 }
        ];
        break;
      case '5':
        chartTitle = 'AGENDAMENTOS CLOSERS';
        chartType = 'donut';
        chartData = [
          { nome: 'Agendados', valor: 65 },
          { nome: 'Não Agendados', valor: 35 }
        ];
        break;
      case '6':
        chartTitle = 'CONVERSÃO PRODUTO/SERVIÇO';
        chartType = 'donut';
        chartData = [
          { nome: 'Convertidos', valor: 75 },
          { nome: 'Não Convertidos', valor: 25 }
        ];
        break;
      case '7':
        chartTitle = 'TICKET MÉDIO CLIENTES';
        chartType = 'column';
        chartData = [
          { mes: 'Jan', valor: 1500 },
          { mes: 'Fev', valor: 1800 },
          { mes: 'Mar', valor: 1650 },
          { mes: 'Abr', valor: 2100 }
        ];
        break;
      case '8':
        chartTitle = 'TX GANHO QUALIFICAÇÃO';
        chartType = 'stacked_bar';
        chartData = [
          { mes: 'Jan', total: 100, agendados: 40 },
          { mes: 'Fev', total: 120, agendados: 55 },
          { mes: 'Mar', total: 150, agendados: 75 }
        ];
        break;
      case '9':
        chartTitle = 'TX GANHO PROSPECÇÃO';
        chartType = 'stacked_bar';
        chartData = [
          { mes: 'Jan', total: 100, propostas: 30 },
          { mes: 'Fev', total: 120, propostas: 45 },
          { mes: 'Mar', total: 150, propostas: 60 }
        ];
        break;
      case '10':
        chartTitle = 'TICKET MÉDIO TRIMESTRAL';
        chartType = 'column';
        chartData = [
          { mes: 'Jan', valor: 1500 },
          { mes: 'Fev', valor: 1800 },
          { mes: 'Mar', valor: 2200 }
        ];
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Posição de gráfico inválida' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      data: chartData,
      chart_config: {
        title: chartTitle,
        subtitle: chartSubtitle,
        type: chartType,
        position: parseInt(position)
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do gráfico:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao obter dados do gráfico', error: error.message },
      { status: 500 }
    );
  }
}
