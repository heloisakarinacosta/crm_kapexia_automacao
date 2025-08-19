# IMPLEMENTAÇÃO MATERIAL DESIGN ICONS (MDI) - CRM KAPEXIA

## 🎯 **VISÃO GERAL**

Este documento fornece um guia completo para implementar a **Material Design Icons (MDI)** no CRM Kapexia, substituindo Font Awesome por ícones mais modernos, orgânicos e otimizados.

### ✅ **VANTAGENS DA MDI:**
- **🎨 Ícones mais orgânicos** e modernos (apenas linhas)
- **🎯 Totalmente customizáveis** (cor, tamanho, stroke)
- **📦 Bundle size menor** com tree-shaking
- **💰 Licença Apache 2.0** (100% livre para SaaS)
- **🔄 Mais de 7.000 ícones** constantemente atualizados
- **⚡ Performance superior** ao Font Awesome

## 🚀 **INSTALAÇÃO**

### **PASSO 1: Instalar Dependências**
```bash
# No diretório do frontend
cd /seu-projeto/frontend

# Instalar MDI React
npm install @mdi/react @mdi/js

# OU se usar yarn
yarn add @mdi/react @mdi/js
```

### **PASSO 2: Verificar Instalação**
```bash
# Verificar se foi instalado corretamente
npm list @mdi/react @mdi/js
```

## 🔧 **COMPONENTES BASE**

### **1. Componente MDIIcon (Wrapper)**

Criar arquivo: `/frontend/src/components/ui/MDIIcon.tsx`

```typescript
import React from 'react';
import Icon from '@mdi/react';

interface MDIIconProps {
  path: string;
  size?: number | string;
  color?: string;
  className?: string;
  onClick?: () => void;
  title?: string;
  spin?: boolean;
  rotate?: number;
}

export const MDIIcon: React.FC<MDIIconProps> = ({
  path,
  size = 1,
  color = 'currentColor',
  className = '',
  onClick,
  title,
  spin = false,
  rotate = 0
}) => {
  const iconStyle = {
    cursor: onClick ? 'pointer' : 'default',
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    animation: spin ? 'spin 1s linear infinite' : undefined
  };

  return (
    <Icon
      path={path}
      size={size}
      color={color}
      className={className}
      onClick={onClick}
      title={title}
      style={iconStyle}
    />
  );
};

export default MDIIcon;
```

### **2. Mapeamento de Ícones do CRM**

Criar arquivo: `/frontend/src/utils/iconMap.ts`

```typescript
import {
  // Dashboard & Analytics
  mdiViewDashboard,
  mdiChartLine,
  mdiChartBar,
  mdiChartPie,
  mdiChartAreaspline,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiAnalytics,
  mdiPoll,
  mdiChartDonut,
  
  // CRM & Leads
  mdiAccount,
  mdiAccountGroup,
  mdiAccountPlus,
  mdiAccountCheck,
  mdiAccountClock,
  mdiAccountStar,
  mdiAccountHeart,
  mdiAccountCancel,
  mdiAccountConvert,
  mdiHandshake,
  mdiTarget,
  
  // WhatsApp & Comunicação
  mdiWhatsapp,
  mdiMessage,
  mdiMessageText,
  mdiMessageReply,
  mdiMessageProcessing,
  mdiPhone,
  mdiCellphone,
  mdiChat,
  mdiChatProcessing,
  mdiSend,
  mdiAttachment,
  mdiMicrophone,
  mdiVideo,
  mdiImage,
  mdiFileDocument,
  
  // Ações Gerais
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiContentDuplicate,
  mdiEye,
  mdiEyeOff,
  mdiDownload,
  mdiUpload,
  mdiRefresh,
  mdiSync,
  mdiCheck,
  mdiClose,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUp,
  mdiArrowDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiChevronDown,
  mdiDotsVertical,
  mdiDotsHorizontal,
  mdiFilter,
  mdiSort,
  mdiSortAscending,
  mdiSortDescending,
  mdiMagnify,
  mdiExport,
  mdiImport,
  mdiPrint,
  mdiShare,
  mdiLink,
  mdiContentCopy,
  
  // Configurações & Sistema
  mdiCog,
  mdiCogOutline,
  mdiTune,
  mdiWrench,
  mdiTools,
  mdiDatabase,
  mdiServer,
  mdiCloud,
  mdiCloudUpload,
  mdiCloudDownload,
  mdiShield,
  mdiShieldCheck,
  mdiKey,
  mdiLock,
  mdiLockOpen,
  
  // Status & Notificações
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiCloseCircle,
  mdiCloseCircleOutline,
  mdiAlertCircle,
  mdiAlertCircleOutline,
  mdiInformation,
  mdiInformationOutline,
  mdiLoading,
  mdiBell,
  mdiBellOutline,
  mdiBellRing,
  mdiAlert,
  mdiAlertDecagram,
  mdiProgressCheck,
  mdiProgressClock,
  mdiProgressDownload,
  mdiProgressUpload,
  
  // Navegação & Menu
  mdiMenu,
  mdiMenuOpen,
  mdiMenuDown,
  mdiMenuUp,
  mdiHome,
  mdiHomeOutline,
  mdiApps,
  mdiViewGrid,
  mdiViewList,
  mdiViewModule,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiExpand,
  mdiCollapse,
  
  // Usuários & Perfil
  mdiAccountCircle,
  mdiAccountCircleOutline,
  mdiAccountBox,
  mdiAccountBoxOutline,
  mdiAccountMultiple,
  mdiAccountMultipleOutline,
  mdiAccountSupervisor,
  mdiAccountTie,
  mdiLogin,
  mdiLogout,
  mdiAccountKey,
  
  // Tempo & Calendário
  mdiCalendar,
  mdiCalendarOutline,
  mdiCalendarClock,
  mdiCalendarCheck,
  mdiCalendarPlus,
  mdiClock,
  mdiClockOutline,
  mdiTimer,
  mdiTimerOutline,
  mdiHistory,
  mdiUpdate,
  
  // Documentos & Arquivos
  mdiFile,
  mdiFileOutline,
  mdiFileDocument,
  mdiFileDocumentOutline,
  mdiFilePdf,
  mdiFileExcel,
  mdiFileWord,
  mdiFileImage,
  mdiFileVideo,
  mdiFileMusic,
  mdiFolder,
  mdiFolderOutline,
  mdiFolderOpen,
  mdiFolderPlus,
  
  // E-commerce & Vendas
  mdiCurrencyUsd,
  mdiCash,
  mdiCashMultiple,
  mdiCreditCard,
  mdiCreditCardOutline,
  mdiCart,
  mdiCartOutline,
  mdiCartPlus,
  mdiTag,
  mdiTagOutline,
  mdiTagMultiple,
  mdiPercent,
  mdiSale,
  
  // Localização & Mapas
  mdiMapMarker,
  mdiMapMarkerOutline,
  mdiMap,
  mdiMapOutline,
  mdiCompass,
  mdiCompassOutline,
  mdiEarth,
  mdiWeb,
  
  // Conectividade & Rede
  mdiWifi,
  mdiWifiOff,
  mdiSignal,
  mdiSignalOff,
  mdiConnection,
  mdiLan,
  mdiRouter,
  mdiCloudOutline,
  
  // Mídia & Entretenimento
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiVolumeHigh,
  mdiVolumeMedium,
  mdiVolumeLow,
  mdiVolumeOff,
  mdiRecord,
  mdiRecordRec,
  
  // Ferramentas & Utilitários
  mdiCalculator,
  mdiRuler,
  mdiPalette,
  mdiColorHelper,
  mdiEyedropper,
  mdiFormatPaint,
  mdiMagic,
  mdiAutoFix,
  mdiTune,
  mdiAdjust,
  
  // Redes Sociais
  mdiFacebook,
  mdiInstagram,
  mdiTwitter,
  mdiLinkedin,
  mdiYoutube,
  mdiGmail,
  mdiGoogle,
  mdiMicrosoft,
  
  // Dispositivos
  mdiMonitor,
  mdiLaptop,
  mdiTablet,
  mdiCellphone,
  mdiWatch,
  mdiKeyboard,
  mdiMouse,
  mdiHeadphones,
  mdiCamera,
  mdiWebcam,
  
  // Clima & Natureza
  mdiWeatherSunny,
  mdiWeatherCloudy,
  mdiWeatherRainy,
  mdiWeatherSnowy,
  mdiLeaf,
  mdiTree,
  mdiFlower,
  mdiSprout
} from '@mdi/js';

export const CRMIcons = {
  // Dashboard & Analytics
  dashboard: mdiViewDashboard,
  analytics: mdiAnalytics,
  chartLine: mdiChartLine,
  chartBar: mdiChartBar,
  chartPie: mdiChartPie,
  chartArea: mdiChartAreaspline,
  chartDonut: mdiChartDonut,
  trending: mdiTrendingUp,
  trendingDown: mdiTrendingDown,
  poll: mdiPoll,
  
  // CRM & Leads
  lead: mdiAccount,
  leads: mdiAccountGroup,
  leadAdd: mdiAccountPlus,
  leadQualified: mdiAccountCheck,
  leadPending: mdiAccountClock,
  leadStar: mdiAccountStar,
  leadHeart: mdiAccountHeart,
  leadCancel: mdiAccountCancel,
  leadConvert: mdiAccountConvert,
  deal: mdiHandshake,
  target: mdiTarget,
  
  // WhatsApp & Comunicação
  whatsapp: mdiWhatsapp,
  message: mdiMessage,
  messageText: mdiMessageText,
  messageReply: mdiMessageReply,
  messageProcessing: mdiMessageProcessing,
  phone: mdiPhone,
  mobile: mdiCellphone,
  chat: mdiChat,
  chatProcessing: mdiChatProcessing,
  send: mdiSend,
  attachment: mdiAttachment,
  microphone: mdiMicrophone,
  video: mdiVideo,
  image: mdiImage,
  document: mdiFileDocument,
  
  // Ações Gerais
  add: mdiPlus,
  edit: mdiPencil,
  delete: mdiDelete,
  duplicate: mdiContentDuplicate,
  view: mdiEye,
  hide: mdiEyeOff,
  download: mdiDownload,
  upload: mdiUpload,
  refresh: mdiRefresh,
  sync: mdiSync,
  check: mdiCheck,
  close: mdiClose,
  arrowLeft: mdiArrowLeft,
  arrowRight: mdiArrowRight,
  arrowUp: mdiArrowUp,
  arrowDown: mdiArrowDown,
  chevronLeft: mdiChevronLeft,
  chevronRight: mdiChevronRight,
  chevronUp: mdiChevronUp,
  chevronDown: mdiChevronDown,
  dotsVertical: mdiDotsVertical,
  dotsHorizontal: mdiDotsHorizontal,
  filter: mdiFilter,
  sort: mdiSort,
  sortAsc: mdiSortAscending,
  sortDesc: mdiSortDescending,
  search: mdiMagnify,
  export: mdiExport,
  import: mdiImport,
  print: mdiPrint,
  share: mdiShare,
  link: mdiLink,
  copy: mdiContentCopy,
  
  // Configurações & Sistema
  settings: mdiCog,
  settingsOutline: mdiCogOutline,
  tune: mdiTune,
  tools: mdiWrench,
  toolbox: mdiTools,
  database: mdiDatabase,
  server: mdiServer,
  cloud: mdiCloud,
  cloudUpload: mdiCloudUpload,
  cloudDownload: mdiCloudDownload,
  shield: mdiShield,
  shieldCheck: mdiShieldCheck,
  key: mdiKey,
  lock: mdiLock,
  unlock: mdiLockOpen,
  
  // Status & Notificações
  success: mdiCheckCircle,
  successOutline: mdiCheckCircleOutline,
  error: mdiCloseCircle,
  errorOutline: mdiCloseCircleOutline,
  warning: mdiAlertCircle,
  warningOutline: mdiAlertCircleOutline,
  info: mdiInformation,
  infoOutline: mdiInformationOutline,
  loading: mdiLoading,
  bell: mdiBell,
  bellOutline: mdiBellOutline,
  bellRing: mdiBellRing,
  alert: mdiAlert,
  alertDecagram: mdiAlertDecagram,
  progressCheck: mdiProgressCheck,
  progressClock: mdiProgressClock,
  progressDownload: mdiProgressDownload,
  progressUpload: mdiProgressUpload,
  
  // Navegação & Menu
  menu: mdiMenu,
  menuOpen: mdiMenuOpen,
  menuDown: mdiMenuDown,
  menuUp: mdiMenuUp,
  home: mdiHome,
  homeOutline: mdiHomeOutline,
  apps: mdiApps,
  grid: mdiViewGrid,
  list: mdiViewList,
  module: mdiViewModule,
  fullscreen: mdiFullscreen,
  fullscreenExit: mdiFullscreenExit,
  expand: mdiExpand,
  collapse: mdiCollapse,
  
  // Usuários & Perfil
  user: mdiAccountCircle,
  userOutline: mdiAccountCircleOutline,
  userBox: mdiAccountBox,
  userBoxOutline: mdiAccountBoxOutline,
  users: mdiAccountMultiple,
  usersOutline: mdiAccountMultipleOutline,
  supervisor: mdiAccountSupervisor,
  userTie: mdiAccountTie,
  login: mdiLogin,
  logout: mdiLogout,
  userKey: mdiAccountKey,
  
  // Tempo & Calendário
  calendar: mdiCalendar,
  calendarOutline: mdiCalendarOutline,
  calendarClock: mdiCalendarClock,
  calendarCheck: mdiCalendarCheck,
  calendarPlus: mdiCalendarPlus,
  clock: mdiClock,
  clockOutline: mdiClockOutline,
  timer: mdiTimer,
  timerOutline: mdiTimerOutline,
  history: mdiHistory,
  update: mdiUpdate,
  
  // Documentos & Arquivos
  file: mdiFile,
  fileOutline: mdiFileOutline,
  fileDocument: mdiFileDocument,
  fileDocumentOutline: mdiFileDocumentOutline,
  filePdf: mdiFilePdf,
  fileExcel: mdiFileExcel,
  fileWord: mdiFileWord,
  fileImage: mdiFileImage,
  fileVideo: mdiFileVideo,
  fileMusic: mdiFileMusic,
  folder: mdiFolder,
  folderOutline: mdiFolderOutline,
  folderOpen: mdiFolderOpen,
  folderPlus: mdiFolderPlus,
  
  // E-commerce & Vendas
  currency: mdiCurrencyUsd,
  cash: mdiCash,
  cashMultiple: mdiCashMultiple,
  creditCard: mdiCreditCard,
  creditCardOutline: mdiCreditCardOutline,
  cart: mdiCart,
  cartOutline: mdiCartOutline,
  cartPlus: mdiCartPlus,
  tag: mdiTag,
  tagOutline: mdiTagOutline,
  tagMultiple: mdiTagMultiple,
  percent: mdiPercent,
  sale: mdiSale,
  
  // Localização & Mapas
  location: mdiMapMarker,
  locationOutline: mdiMapMarkerOutline,
  map: mdiMap,
  mapOutline: mdiMapOutline,
  compass: mdiCompass,
  compassOutline: mdiCompassOutline,
  earth: mdiEarth,
  web: mdiWeb,
  
  // Conectividade & Rede
  wifi: mdiWifi,
  wifiOff: mdiWifiOff,
  signal: mdiSignal,
  signalOff: mdiSignalOff,
  connection: mdiConnection,
  lan: mdiLan,
  router: mdiRouter,
  cloudOutline: mdiCloudOutline,
  
  // Mídia & Entretenimento
  play: mdiPlay,
  pause: mdiPause,
  stop: mdiStop,
  skipNext: mdiSkipNext,
  skipPrevious: mdiSkipPrevious,
  volumeHigh: mdiVolumeHigh,
  volumeMedium: mdiVolumeMedium,
  volumeLow: mdiVolumeLow,
  volumeOff: mdiVolumeOff,
  record: mdiRecord,
  recordRec: mdiRecordRec,
  
  // Ferramentas & Utilitários
  calculator: mdiCalculator,
  ruler: mdiRuler,
  palette: mdiPalette,
  colorHelper: mdiColorHelper,
  eyedropper: mdiEyedropper,
  formatPaint: mdiFormatPaint,
  magic: mdiMagic,
  autoFix: mdiAutoFix,
  tuneIcon: mdiTune,
  adjust: mdiAdjust,
  
  // Redes Sociais
  facebook: mdiFacebook,
  instagram: mdiInstagram,
  twitter: mdiTwitter,
  linkedin: mdiLinkedin,
  youtube: mdiYoutube,
  gmail: mdiGmail,
  google: mdiGoogle,
  microsoft: mdiMicrosoft,
  
  // Dispositivos
  monitor: mdiMonitor,
  laptop: mdiLaptop,
  tablet: mdiTablet,
  cellphone: mdiCellphone,
  watch: mdiWatch,
  keyboard: mdiKeyboard,
  mouse: mdiMouse,
  headphones: mdiHeadphones,
  camera: mdiCamera,
  webcam: mdiWebcam,
  
  // Clima & Natureza
  sunny: mdiWeatherSunny,
  cloudy: mdiWeatherCloudy,
  rainy: mdiWeatherRainy,
  snowy: mdiWeatherSnowy,
  leaf: mdiLeaf,
  tree: mdiTree,
  flower: mdiFlower,
  sprout: mdiSprout
};

export default CRMIcons;
```

### **3. Tema de Cores e Tamanhos**

Criar arquivo: `/frontend/src/styles/iconTheme.ts`

```typescript
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
```

### **4. Hook para Ícones**

Criar arquivo: `/frontend/src/hooks/useIcon.ts`

```typescript
import { useMemo } from 'react';
import { CRMIcons } from '../utils/iconMap';
import { IconTheme } from '../styles/iconTheme';

interface UseIconProps {
  name: keyof typeof CRMIcons;
  context?: keyof typeof IconTheme.contexts;
  size?: keyof typeof IconTheme.sizes | number;
  color?: keyof typeof IconTheme.colors | string;
  active?: boolean;
}

export const useIcon = ({
  name,
  context,
  size,
  color,
  active = false
}: UseIconProps) => {
  const iconConfig = useMemo(() => {
    const path = CRMIcons[name];
    
    // Determinar tamanho
    let iconSize: number;
    if (typeof size === 'number') {
      iconSize = size;
    } else if (size && IconTheme.sizes[size]) {
      iconSize = IconTheme.sizes[size];
    } else if (context && IconTheme.contexts[context]) {
      iconSize = IconTheme.contexts[context].size;
    } else {
      iconSize = IconTheme.sizes.md;
    }
    
    // Determinar cor
    let iconColor: string;
    if (color && IconTheme.colors[color as keyof typeof IconTheme.colors]) {
      iconColor = IconTheme.colors[color as keyof typeof IconTheme.colors];
    } else if (typeof color === 'string' && color.startsWith('#')) {
      iconColor = color;
    } else if (context && IconTheme.contexts[context]) {
      const contextConfig = IconTheme.contexts[context];
      iconColor = active && 'activeColor' in contextConfig 
        ? contextConfig.activeColor! 
        : contextConfig.color;
    } else {
      iconColor = 'currentColor';
    }
    
    return {
      path,
      size: iconSize,
      color: iconColor
    };
  }, [name, context, size, color, active]);
  
  return iconConfig;
};

export default useIcon;
```

## 📱 **EXEMPLOS DE USO PRÁTICO**

### **1. Sidebar com MDI**

```typescript
// Em /frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
import { IconTheme } from '../../styles/iconTheme';

const Sidebar = () => {
  const pathname = usePathname();
  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: CRMIcons.dashboard,
      current: pathname === '/admin/dashboard'
    },
    {
      name: 'Leads',
      href: '/admin/leads',
      icon: CRMIcons.leads,
      current: pathname.startsWith('/admin/leads')
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: CRMIcons.analytics,
      current: pathname.startsWith('/admin/analytics')
    },
    {
      name: 'WhatsApp',
      href: '/admin/whatsapp',
      icon: CRMIcons.whatsapp,
      current: pathname.startsWith('/admin/whatsapp')
    },
    {
      name: 'Configurações',
      href: '/admin/settings',
      icon: CRMIcons.settings,
      current: pathname.startsWith('/admin/settings')
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                item.current 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                <MDIIcon 
                  path={item.icon} 
                  size={IconTheme.contexts.sidebar.size}
                  color={item.current ? IconTheme.colors.primary : IconTheme.contexts.sidebar.color}
                />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
```

### **2. Botões com Ícones**

```typescript
// Componente de botão reutilizável
import React from 'react';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
import { IconTheme } from '../../styles/iconTheme';

interface IconButtonProps {
  icon: keyof typeof CRMIcons;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizes = {
    sm: IconTheme.sizes.sm,
    md: IconTheme.sizes.md,
    lg: IconTheme.sizes.lg
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center space-x-2 rounded-md font-medium transition-colors
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <MDIIcon 
        path={loading ? CRMIcons.loading : CRMIcons[icon]} 
        size={iconSizes[size]}
        spin={loading}
      />
      <span>{label}</span>
    </button>
  );
};

// Uso:
<IconButton 
  icon="add" 
  label="Novo Lead" 
  variant="primary" 
  onClick={() => console.log('Criar lead')} 
/>

<IconButton 
  icon="download" 
  label="Exportar" 
  variant="secondary" 
  size="sm"
  onClick={() => console.log('Exportar dados')} 
/>
```

### **3. Tabela com Ações**

```typescript
// Componente de ações da tabela
import React from 'react';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
import { IconTheme } from '../../styles/iconTheme';

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  disabled = false
}) => {
  const ActionButton = ({ 
    icon, 
    onClick, 
    title, 
    color = IconTheme.contexts.table.color 
  }: {
    icon: keyof typeof CRMIcons;
    onClick?: () => void;
    title: string;
    color?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      title={title}
      className={`p-1 rounded hover:bg-gray-100 transition-colors ${
        disabled || !onClick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <MDIIcon 
        path={CRMIcons[icon]} 
        size={IconTheme.contexts.table.size}
        color={color}
      />
    </button>
  );

  return (
    <div className="flex items-center space-x-1">
      {onView && (
        <ActionButton 
          icon="view" 
          onClick={onView} 
          title="Visualizar"
          color={IconTheme.colors.info}
        />
      )}
      {onEdit && (
        <ActionButton 
          icon="edit" 
          onClick={onEdit} 
          title="Editar"
          color={IconTheme.colors.primary}
        />
      )}
      {onDuplicate && (
        <ActionButton 
          icon="duplicate" 
          onClick={onDuplicate} 
          title="Duplicar"
          color={IconTheme.colors.secondary}
        />
      )}
      {onDelete && (
        <ActionButton 
          icon="delete" 
          onClick={onDelete} 
          title="Excluir"
          color={IconTheme.colors.error}
        />
      )}
    </div>
  );
};

// Uso na tabela:
<TableActions
  onView={() => console.log('Ver lead')}
  onEdit={() => console.log('Editar lead')}
  onDuplicate={() => console.log('Duplicar lead')}
  onDelete={() => console.log('Excluir lead')}
/>
```

### **4. Status com Ícones**

```typescript
// Componente de status
import React from 'react';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
import { IconTheme } from '../../styles/iconTheme';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md'
}) => {
  const statusConfig = {
    success: {
      icon: CRMIcons.success,
      color: IconTheme.colors.success,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    warning: {
      icon: CRMIcons.warning,
      color: IconTheme.colors.warning,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    },
    error: {
      icon: CRMIcons.error,
      color: IconTheme.colors.error,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    },
    info: {
      icon: CRMIcons.info,
      color: IconTheme.colors.info,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    pending: {
      icon: CRMIcons.progressClock,
      color: IconTheme.colors.warning,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    }
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };
  
  const iconSizes = {
    sm: IconTheme.sizes.xs,
    md: IconTheme.sizes.sm,
    lg: IconTheme.sizes.md
  };

  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full font-medium
      ${config.bgColor} ${config.textColor} ${sizeClasses[size]}
    `}>
      <MDIIcon 
        path={config.icon} 
        size={iconSizes[size]}
        color={config.color}
      />
      <span>{label}</span>
    </span>
  );
};

// Uso:
<StatusBadge status="success" label="Qualificado" />
<StatusBadge status="warning" label="Pendente" size="sm" />
<StatusBadge status="error" label="Perdido" />
```

### **5. Cards com Ícones**

```typescript
// Componente de card estatística
import React from 'react';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
import { IconTheme } from '../../styles/iconTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof CRMIcons;
  color?: keyof typeof IconTheme.colors;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  onClick
}) => {
  const iconColor = IconTheme.colors[color];
  
  return (
    <div 
      className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <MDIIcon 
                path={trend.isPositive ? CRMIcons.trending : CRMIcons.trendingDown}
                size={IconTheme.sizes.sm}
                color={trend.isPositive ? IconTheme.colors.success : IconTheme.colors.error}
              />
              <span className={`ml-1 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${iconColor}20` }}>
          <MDIIcon 
            path={CRMIcons[icon]} 
            size={IconTheme.contexts.card.size}
            color={iconColor}
          />
        </div>
      </div>
    </div>
  );
};

// Uso:
<StatCard
  title="Total de Leads"
  value="1,234"
  icon="leads"
  color="primary"
  trend={{ value: 12, isPositive: true }}
  onClick={() => console.log('Ver leads')}
/>

<StatCard
  title="Conversões"
  value="89"
  icon="leadQualified"
  color="success"
  trend={{ value: 5, isPositive: true }}
/>
```

## 🔄 **MIGRAÇÃO GRADUAL**

### **1. Estratégia de Migração**

```typescript
// Hook para controlar migração gradual
import { useState, useEffect } from 'react';

export const useMigrationFlag = (featureName: string) => {
  const [useNewIcons, setUseNewIcons] = useState(false);
  
  useEffect(() => {
    // Verificar localStorage ou configuração
    const migrationFlags = JSON.parse(
      localStorage.getItem('migrationFlags') || '{}'
    );
    
    setUseNewIcons(migrationFlags[featureName] || false);
  }, [featureName]);
  
  const toggleMigration = () => {
    const migrationFlags = JSON.parse(
      localStorage.getItem('migrationFlags') || '{}'
    );
    
    migrationFlags[featureName] = !useNewIcons;
    localStorage.setItem('migrationFlags', JSON.stringify(migrationFlags));
    setUseNewIcons(!useNewIcons);
  };
  
  return { useNewIcons, toggleMigration };
};

// Uso em componentes:
const Sidebar = () => {
  const { useNewIcons } = useMigrationFlag('sidebar');
  
  return (
    <div>
      {useNewIcons ? (
        <MDIIcon path={CRMIcons.dashboard} size={1} />
      ) : (
        <FontAwesomeIcon icon={faDashboard} />
      )}
    </div>
  );
};
```

### **2. Componente Híbrido**

```typescript
// Componente que suporta ambos os sistemas
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import MDIIcon from './MDIIcon';

interface HybridIconProps {
  // MDI props
  mdiPath?: string;
  // FontAwesome props
  faIcon?: IconDefinition;
  // Comum
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
  // Controle
  preferMDI?: boolean;
}

export const HybridIcon: React.FC<HybridIconProps> = ({
  mdiPath,
  faIcon,
  size = 1,
  color = 'currentColor',
  className = '',
  onClick,
  preferMDI = true
}) => {
  // Priorizar MDI se disponível e preferido
  if (preferMDI && mdiPath) {
    return (
      <MDIIcon
        path={mdiPath}
        size={size}
        color={color}
        className={className}
        onClick={onClick}
      />
    );
  }
  
  // Fallback para FontAwesome
  if (faIcon) {
    return (
      <FontAwesomeIcon
        icon={faIcon}
        size={size as any}
        color={color}
        className={className}
        onClick={onClick}
      />
    );
  }
  
  // Fallback final
  return <span className={className}>?</span>;
};

// Uso:
<HybridIcon
  mdiPath={CRMIcons.dashboard}
  faIcon={faDashboard}
  size={1}
  preferMDI={true}
/>
```

## 📊 **PERFORMANCE E OTIMIZAÇÃO**

### **1. Tree Shaking**

```typescript
// ❌ Importação incorreta (importa toda a biblioteca)
import * as mdiIcons from '@mdi/js';

// ✅ Importação correta (tree shaking)
import { 
  mdiHome, 
  mdiAccount, 
  mdiSettings 
} from '@mdi/js';
```

### **2. Lazy Loading de Ícones**

```typescript
// Para ícones raramente usados
import { lazy, Suspense } from 'react';

const LazyIcon = lazy(() => import('./LazyIconComponent'));

// Uso:
<Suspense fallback={<div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />}>
  <LazyIcon name="rareIcon" />
</Suspense>
```

### **3. Bundle Analysis**

```bash
# Analisar tamanho do bundle
npm install --save-dev @next/bundle-analyzer

# Configurar no next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // sua configuração
});

# Executar análise
ANALYZE=true npm run build
```

## 🎨 **CUSTOMIZAÇÃO AVANÇADA**

### **1. Ícones Personalizados**

```typescript
// Criar ícones SVG personalizados no formato MDI
export const CustomIcons = {
  // Ícone personalizado do CRM Kapexia
  kapexiaLogo: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
  
  // Ícone personalizado de funil
  salesFunnel: 'M3,2V4H21V2H3M4,6V8H20V6H4M6,10V12H18V10H6M8,14V16H16V14H8M10,18V20H14V18H10Z'
};

// Uso:
<MDIIcon path={CustomIcons.kapexiaLogo} size={1.5} color="#3B82F6" />
```

### **2. Animações Personalizadas**

```css
/* Em globals.css */
@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes rotate-icon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce-icon {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-8px); }
  70% { transform: translateY(-4px); }
  90% { transform: translateY(-2px); }
}

.icon-pulse { animation: pulse-icon 2s infinite; }
.icon-rotate { animation: rotate-icon 1s linear infinite; }
.icon-bounce { animation: bounce-icon 1s infinite; }
```

```typescript
// Componente com animações
<MDIIcon 
  path={CRMIcons.loading} 
  size={1} 
  className="icon-rotate" 
/>

<MDIIcon 
  path={CRMIcons.bell} 
  size={1} 
  className="icon-pulse" 
/>
```

### **3. Temas Dinâmicos**

```typescript
// Hook para tema dinâmico
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useThemeIcon = () => {
  const { theme } = useContext(ThemeContext);
  
  const getThemedColor = (colorName: keyof typeof IconTheme.colors) => {
    if (theme === 'dark') {
      // Cores para tema escuro
      const darkColors = {
        primary: '#60A5FA',
        secondary: '#34D399',
        gray: '#9CA3AF',
        // ... outras cores
      };
      return darkColors[colorName] || IconTheme.colors[colorName];
    }
    
    return IconTheme.colors[colorName];
  };
  
  return { getThemedColor };
};

// Uso:
const { getThemedColor } = useThemeIcon();

<MDIIcon 
  path={CRMIcons.dashboard} 
  size={1} 
  color={getThemedColor('primary')} 
/>
```

## 🧪 **TESTES**

### **1. Teste de Componente**

```typescript
// __tests__/MDIIcon.test.tsx
import { render, screen } from '@testing-library/react';
import MDIIcon from '../components/ui/MDIIcon';
import { CRMIcons } from '../utils/iconMap';

describe('MDIIcon', () => {
  it('renders icon correctly', () => {
    render(
      <MDIIcon 
        path={CRMIcons.dashboard} 
        size={1} 
        title="Dashboard Icon"
      />
    );
    
    const icon = screen.getByTitle('Dashboard Icon');
    expect(icon).toBeInTheDocument();
  });
  
  it('applies correct size', () => {
    render(
      <MDIIcon 
        path={CRMIcons.dashboard} 
        size={2} 
        title="Large Icon"
      />
    );
    
    const icon = screen.getByTitle('Large Icon');
    expect(icon).toHaveAttribute('width', '40'); // 2 * 20px
  });
});
```

### **2. Teste de Integração**

```typescript
// __tests__/IconIntegration.test.tsx
import { render, screen } from '@testing-library/react';
import Sidebar from '../components/layout/Sidebar';

describe('Icon Integration', () => {
  it('renders all sidebar icons', () => {
    render(<Sidebar />);
    
    // Verificar se todos os ícones da sidebar são renderizados
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
    expect(screen.getByTitle('Leads')).toBeInTheDocument();
    expect(screen.getByTitle('Analytics')).toBeInTheDocument();
  });
});
```

## 📚 **DOCUMENTAÇÃO DE REFERÊNCIA**

### **1. Guia de Ícones por Contexto**

| Contexto | Ícones Recomendados | Tamanho | Cor |
|----------|-------------------|---------|-----|
| **Sidebar** | dashboard, leads, analytics, whatsapp, settings | 1 (20px) | #6B7280 / #3B82F6 (ativo) |
| **Botões** | add, edit, delete, save, cancel | 0.8 (16px) | currentColor |
| **Tabela** | view, edit, duplicate, delete | 0.8 (16px) | #6B7280 |
| **Status** | success, warning, error, info | 0.8 (16px) | Cor do status |
| **Cards** | trending, leads, currency, analytics | 1.2 (24px) | Cor do tema |
| **Header** | menu, user, bell, search | 1 (20px) | #1F2937 |

### **2. Mapeamento Font Awesome → MDI**

| Font Awesome | MDI Equivalente | CRMIcons |
|--------------|----------------|----------|
| `faDashboard` | `mdiViewDashboard` | `CRMIcons.dashboard` |
| `faUsers` | `mdiAccountGroup` | `CRMIcons.leads` |
| `faChartLine` | `mdiChartLine` | `CRMIcons.analytics` |
| `faWhatsapp` | `mdiWhatsapp` | `CRMIcons.whatsapp` |
| `faCog` | `mdiCog` | `CRMIcons.settings` |
| `faPlus` | `mdiPlus` | `CRMIcons.add` |
| `faEdit` | `mdiPencil` | `CRMIcons.edit` |
| `faTrash` | `mdiDelete` | `CRMIcons.delete` |
| `faEye` | `mdiEye` | `CRMIcons.view` |
| `faDownload` | `mdiDownload` | `CRMIcons.download` |

### **3. Checklist de Migração**

- [ ] **Instalar dependências** (`@mdi/react @mdi/js`)
- [ ] **Criar componente MDIIcon** base
- [ ] **Configurar mapeamento** de ícones (iconMap.ts)
- [ ] **Definir tema** de cores e tamanhos
- [ ] **Migrar Sidebar** (componente principal)
- [ ] **Migrar botões** de ação
- [ ] **Migrar tabelas** e listas
- [ ] **Migrar cards** e estatísticas
- [ ] **Migrar status** e badges
- [ ] **Testar responsividade** em diferentes telas
- [ ] **Verificar acessibilidade** (títulos, cores)
- [ ] **Otimizar bundle** (tree shaking)
- [ ] **Documentar mudanças** para equipe
- [ ] **Remover Font Awesome** (opcional)

## 🚀 **PRÓXIMOS PASSOS**

### **1. Implementação Imediata**
1. Instalar dependências MDI
2. Criar componente MDIIcon base
3. Configurar mapeamento de ícones
4. Migrar Sidebar (impacto visual imediato)

### **2. Implementação Gradual**
1. Migrar botões principais
2. Migrar tabelas e ações
3. Migrar cards e estatísticas
4. Migrar modais e formulários

### **3. Otimização**
1. Implementar lazy loading
2. Configurar tree shaking
3. Analisar bundle size
4. Otimizar performance

### **4. Personalização**
1. Criar ícones customizados
2. Implementar animações
3. Configurar temas dinâmicos
4. Adicionar acessibilidade

---

## 📞 **SUPORTE**

Para dúvidas sobre implementação:
1. Consulte a [documentação oficial MDI](https://pictogrammers.com/library/mdi/)
2. Verifique os exemplos neste documento
3. Teste em ambiente de desenvolvimento primeiro
4. Faça backup antes de aplicar em produção

**🎨 Transforme seu CRM com ícones modernos e orgânicos!**

