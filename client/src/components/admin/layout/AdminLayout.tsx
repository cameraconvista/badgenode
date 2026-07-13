import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Settings, LogOut } from '@/lib/icons';
import { useAuth } from '@/contexts/AuthContext';
import { APP_UNLOCK_KEY } from '@/components/home/AppPinGate';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar/index';
import { ADMIN_NAV_ITEMS } from './adminNavItems';

interface AdminLayoutProps {
  /** Accettato per compatibilità con i chiamanti; non più mostrato in topbar
      (la topbar mobile mostra solo il logo centrato). */
  title?: string;
  children: ReactNode;
}

/**
 * Guscio condiviso della sezione admin: sidebar laterale persistente su
 * desktop, drawer a scomparsa su mobile (via shadcn Sidebar/Sheet).
 * Non contiene logica di business: ospita soltanto la navigazione e le pagine.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const go = (href: string) => setLocation(href);

  // Logout generale: chiude la sessione auth e ri-blocca l'app (rimuove lo sblocco
  // del gate PIN), poi torna alla Home — che richiederà di nuovo il PIN se attivo.
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* prosegue comunque al reset del gate + redirect */
    }
    sessionStorage.removeItem(APP_UNLOCK_KEY);
    window.location.href = '/';
  };

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden bg-[#F8F3EE]">
        <Sidebar variant="sidebar" collapsible="offcanvas">
          <SidebarHeader className="border-b border-[rgba(122,18,40,0.12)] px-4 py-4">
            <div className="flex items-center justify-center">
              <img src="/logo_badgenode.png" alt="BADGENODE" className="h-9 w-auto" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-3 mt-4">
            <SidebarMenu>
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.match(location);
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => go(item.href)}
                      className="h-11 gap-3 text-base text-[#1C0A10] data-[active=true]:bg-[#B68787] data-[active=true]:text-white hover:bg-[#F5EBE0] hover:text-[#7A1228]"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* Separatore: stacca Impostazioni dalle sezioni principali. */}
              <li aria-hidden className="my-2 border-t border-[rgba(122,18,40,0.12)]" />
              {/* Impostazioni: staccata dalle voci principali da una linea sottile. */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.startsWith('/impostazioni')}
                  onClick={() => go('/impostazioni')}
                  className="h-11 gap-3 text-base text-[#1C0A10] data-[active=true]:bg-[#B68787] data-[active=true]:text-white hover:bg-[#F5EBE0] hover:text-[#7A1228]"
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Impostazioni</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="px-2 py-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => go('/')}
                  className="h-11 gap-3 text-base text-[#7A5A64] hover:bg-[#F5EBE0] hover:text-[#7A1228]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Torna al Badge</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Linea separatrice in mezzo ai due pulsanti. */}
              <li aria-hidden className="my-2 border-t border-[rgba(122,18,40,0.12)]" />
              {/* Logout generale dall'app: sotto "Torna al Badge". */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="h-11 gap-3 text-base text-[#7A1228] hover:bg-[#F5EBE0] hover:text-[#7A1228]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="h-full min-h-0 overflow-hidden bg-[#F8F3EE]">
          {/* Topbar visibile su telefono e tablet portrait (<1024px): apre il drawer.
              Sopra 1024px la sidebar è fissa a lato e la topbar sparisce. */}
          {/* Head bar mobile: logo centrato geometricamente (absolute), hamburger a
              destra. Nessun titolo di sezione (rimosso su richiesta). */}
          <div className="relative flex items-center border-b border-[rgba(122,18,40,0.12)] bg-white px-4 py-3 lg:hidden">
            <img
              src="/logo_badgenode.png"
              alt="BADGENODE"
              className="pointer-events-none absolute left-1/2 h-7 w-auto -translate-x-1/2"
            />
            {/* Trigger drawer allineato a destra (standard tablet app). */}
            <SidebarTrigger className="ml-auto text-[#7A1228]" />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
