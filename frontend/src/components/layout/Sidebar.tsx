"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import MDIIcon from '../ui/MDIIcon';
import { CRMIcons } from '../../utils/iconMap';
// import { IconTheme } from '../../styles/iconTheme';

// Definição de tipos para os itens do menu
interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path: string;
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  // Recebe collapsed e setCollapsed via props
  // const [collapsed, setCollapsed] = React.useState(true); // Removido, agora vem de props
  const [showSettingsSubmenu, setShowSettingsSubmenu] = React.useState(false);
  const toggleSidebar = () => {
    setCollapsed((prev: boolean) => {
      if (!prev) setShowSettingsSubmenu(false); // ao colapsar, esconde submenu forçado
      return !prev;
    });
  };
  
  const router = useRouter();

  const handleSettingsClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (collapsed) {
      e.preventDefault();
      setCollapsed(false);
      setShowSettingsSubmenu(true); // força submenu a aparecer
      setTimeout(() => {
        if (router && !pathname.startsWith('/admin/settings')) {
          router.push('/admin/settings');
        }
      }, 100); // delay maior para garantir expansão visual
    }
  };

  React.useEffect(() => {
    // Sempre que a rota mudar para settings, desativa o forçamento do submenu
    if (pathname.startsWith('/admin/settings') && showSettingsSubmenu) {
      setShowSettingsSubmenu(false);
    }
  }, [pathname, showSettingsSubmenu]);

  // Itens do menu - futuramente podem vir de uma API ou configuração
  const menuItems: MenuItem[] = [
    { id: 'dashboard', name: 'Dashboard', icon: CRMIcons.home, path: '/admin/dashboard' },
    { id: 'analytics', name: 'Análises', icon: CRMIcons.dashboard, path: '/admin/analytics' },
    { id: 'estrategias', name: 'Estratégias', icon: CRMIcons.trending, path: '/admin/estrategias' },
    { id: 'whatsapp', name: 'WhatsApp', icon: CRMIcons.whatsapp, path: '/admin/whatsapp' },
    { id: 'chat', name: 'Chat IA', icon: CRMIcons.chat, path: '/admin/chat' },
    { id: 'automacao', name: 'Automação', icon: CRMIcons.automation, path: '/admin/automacao' },
    { id: 'settings', name: 'Configurações', icon: CRMIcons.settings, path: '/admin/settings' },
  ];


  // Itens do submenu de configurações
  const settingsSubItems: MenuItem[] = [
    { id: 'clients', name: 'Clientes', icon: CRMIcons.leads, path: '/admin/settings/clients' },
    { id: 'whatsapp-instances', name: 'Instâncias WhatsApp', icon: CRMIcons.whatsapp, path: '/admin/settings/whatsapp' },
    { id: 'chart-configs', name: 'Configuração de Painéis', icon: CRMIcons.chartDonut, path: '/admin/settings/chart-configs' },
    { id: 'dashboard-config', name: 'Configuração Dashboard', icon: CRMIcons.dashboard, path: '/admin/settings/dashboard' },
  ];

  return (
    <aside 
      className={`h-screen transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } fixed left-0 top-0 z-10`}
      style={{ backgroundColor: '#1C1C1C' }}
    >
      {/* Header com logo e botão de toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center">
            <Image 
              src="/images/logo9-fundo_escuro.png"
              alt="Kapexia CRM"
              width={180}
              height={101}
              className="object-contain"
            />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full py-4">
            <Image 
              src="/images/logo-120.png"
              alt="Kapexia CRM"
              width={180}
              height={180}
              className="object-contain cursor-pointer"
              onClick={toggleSidebar}
            />
          </div>
        )}
        {!collapsed && (
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            ←
          </button>
        )}
      </div>

      {/* Menu de navegação */}
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => {
            const isActive = (item.id === 'settings')
              ? pathname.startsWith('/admin/settings')
              : pathname === item.path;
            return (
              <li key={item.id} className="mb-2">
                {item.id === 'settings' ? (
                  <div>
                    <Link
                      href={item.path}
                      onClick={handleSettingsClick}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#E0D040] text-[#222]' // fundo amarelo, texto escuro
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <MDIIcon path={item.icon} size={2} color={isActive ? '#222' : '#40E0D0'} className="text-current" />
                      {!collapsed && <span className="ml-2">{item.name}</span>}
                    </Link>
                    {/* Submenu de configurações */}
                    {(!collapsed && (isActive || showSettingsSubmenu)) && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {settingsSubItems.map((subItem) => {
                          const isSubActive = pathname === subItem.path || pathname.startsWith(subItem.path + '/');
                          return (
                            <li key={subItem.id}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                                  isSubActive
                                    ? 'bg-[#E0D040] text-[#222]'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                              >
                                <MDIIcon path={subItem.icon} size={1} color={isSubActive ? '#222' : '#40E0D0'} className="mr-2 text-current" />
                                <span>{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-[#E0D040] text-[#222]'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                    // Não expande ao clicar em outros ícones
                  >
                    <MDIIcon path={item.icon} size={2} color={isActive ? '#222' : '#40E0D0'} className="text-current" />
                    {!collapsed && <span className="ml-2">{item.name}</span>}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer com informações do usuário - futuramente virá da sessão */}
      <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">admin@kapexia.com</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
              A
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
