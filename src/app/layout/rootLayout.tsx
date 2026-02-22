import React, { useState } from 'react';
import { Menu, X, Home, Users, Package, Settings, BarChart2, LogOut, ChevronDown, Bell, User } from 'lucide-react';
import { Link, Outlet } from '@tanstack/react-router';
import ThemeToggle from '../../theme';
import Button from '../../ui/button';
import { authService } from '../../core/auth/auth-service';
import Flex from '../../ui/flex';
import { DropdownContent, DropdownHeader, DropdownItem, DropdownMenu, DropdownTrigger } from '../../ui/dropdown-menu';

export interface IRootLayoutProps {
  children?: React.ReactNode;
}

export function DropDownUserMenu() {
  async function handleLogoutAsync() {
    await authService.logout();
  }

  return (
    <DropdownMenu>
      <DropdownTrigger>
        <Flex
          align="center"
          justify="center"
          className="h-8 w-8 cursor-pointer rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
          JS
        </Flex>
      </DropdownTrigger>

      <DropdownContent width="w-72">
        <DropdownHeader>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">Usuário Demo</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">usuario@dominio.com</span>
            </div>
          </div>
        </DropdownHeader>

        <DropdownItem as="a" href="#perfil" icon={User}>
          Meu perfil
        </DropdownItem>

        <DropdownItem as="a" href="#notificacoes" icon={Bell}>
          Notificações
        </DropdownItem>

        <DropdownItem as="button" variant="destructive" icon={LogOut} onClick={handleLogoutAsync}>
          Sair
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}

export const RootLayout: React.FC<React.PropsWithChildren<IRootLayoutProps>> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  async function handleLogoutAsync() {
    await authService.logout();
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* 1. SIDEBAR (Desktop & Mobile Overlay) */}

      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={handleToggleSidebar}
      />

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-cyan-500">JujéUái</span>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <NavItem to="/home" icon={Home} label="Dashboard" />

          <div className="space-y-1">
            <button
              onClick={() => toggleSubmenu('cadastros')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users size={18} />
                <span>Cadastros</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${openSubmenu === 'cadastros' ? 'rotate-180' : ''}`} />
            </button>

            {openSubmenu === 'cadastros' && (
              <div className="pl-10 space-y-1 animate-in slide-in-from-top-1 duration-200">
                <NavItem to="/cadastros/cliente" label="Cliente" size="sm" />
                <NavItem to="/cadastros/empreendimento" label="Empreendimento" size="sm" />
                <NavItem to="/cadastros/fornecedor" label="Fornecedor" size="sm" />
              </div>
            )}
          </div>

          <NavItem to="/pedidos" icon={Package} label="Pedidos" />
          <NavItem to="/relatorios" icon={BarChart2} label="Relatórios" />

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
            <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogoutAsync}
            leftIcon={<LogOut size={18} />}>
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Flex
          as="header"
          align="center"
          justify="between"
          className="h-14 flex px-4 sm:px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <Flex align="center" gap={4}>
            <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">Dashboard</h1>
          </Flex>

          <Flex align="center" className="gap-4">
            <ThemeToggle />
            <DropDownUserMenu />
          </Flex>
        </Flex>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-4">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

// Helper Component para Links de Navegação
interface NavItemProps {
  to: string;
  icon?: any;
  label: string;
  size?: 'sm' | 'md';
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, size = 'md' }) => {
  return (
    <Link
      to={to}
      className={`
      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
      text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400
      [&.active]:bg-blue-50 dark:[&.active]:bg-blue-900/20 [&.active]:text-blue-600 dark:[&.active]:text-blue-400
      ${size === 'sm' ? 'text-sm py-1.5' : 'text-sm font-medium'}
    `}>
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );
};
