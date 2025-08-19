export const IconTheme = {
  colors: {
    // Cores principais do CRM
    primary: '#3B82F6',      // Azul principal
    secondary: '#10B981',    // Verde secundário
    accent: '#8B5CF6',       // Roxo de destaque
    
    // Status
    success: '#22C55E',      // Verde sucesso
    warning: '#F59E0B',      // Amarelo aviso
    error: '#EF4444',        // Vermelho erro
    info: '#06B6D4',         // Ciano informação
    
    // Neutros
    gray: '#6B7280',         // Cinza padrão
    grayLight: '#9CA3AF',    // Cinza claro
    grayDark: '#374151',     // Cinza escuro
    dark: '#1F2937',         // Escuro
    white: '#FFFFFF',        // Branco
    
    // WhatsApp
    whatsapp: '#25D366',     // Verde WhatsApp
    whatsappDark: '#128C7E', // Verde WhatsApp escuro
    
    // Específicos do CRM
    lead: '#3B82F6',         // Azul para leads
    qualified: '#22C55E',    // Verde para qualificados
    pending: '#F59E0B',      // Amarelo para pendentes
    lost: '#EF4444',         // Vermelho para perdidos
    
    // Analytics
    chart1: '#3B82F6',       // Azul
    chart2: '#10B981',       // Verde
    chart3: '#F59E0B',       // Amarelo
    chart4: '#EF4444',       // Vermelho
    chart5: '#8B5CF6',       // Roxo
    chart6: '#06B6D4',       // Ciano
    chart7: '#F97316',       // Laranja
    chart8: '#EC4899'        // Rosa
  },
  
  sizes: {
    xs: 0.6,    // 12px (ícones muito pequenos)
    sm: 0.8,    // 16px (ícones pequenos)
    md: 1,      // 20px (ícones médios - padrão)
    lg: 1.2,    // 24px (ícones grandes)
    xl: 1.5,    // 30px (ícones extra grandes)
    xxl: 2,     // 40px (ícones muito grandes)
    xxxl: 3     // 60px (ícones gigantes)
  },
  
  // Configurações de contexto
  contexts: {
    sidebar: {
      size: 1,
      color: '#6B7280',
      activeColor: '#3B82F6'
    },
    button: {
      size: 0.8,
      color: 'currentColor'
    },
    table: {
      size: 0.8,
      color: '#6B7280'
    },
    card: {
      size: 1.2,
      color: '#374151'
    },
    header: {
      size: 1,
      color: '#1F2937'
    },
    status: {
      size: 0.8
    }
  }
};

export default IconTheme;

