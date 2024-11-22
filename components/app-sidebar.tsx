import * as React from "react";

import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Speech, Users2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Para obtener la ruta actual

const navData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
    roles: ["ADMIN"], // Solo visible para el rol ADMIN
  },
  {
    title: "Solicitudes",
    url: "/dashboard/solicitudes",
    icon: <Speech />,
    roles: ["ADMIN", "USUARIO", "OPERARIO"], // Visible para ADMIN, USUARIO, OPERARIO
  },
  {
    title: "Usuarios",
    url: "/dashboard/users",
    icon: <Users2 />,
    roles: ["ADMIN"], // Solo visible para el rol ADMIN
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const pathname = usePathname(); // Obtener la ruta actual

  // Filtrar las opciones de navegación según el rol del usuario
  const filteredNav = navData.filter((item) => item.roles.includes(user?.role));

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {filteredNav.map((item) => {
          const isActive = pathname === item.url; // Verificar si el enlace está activo
          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center space-x-2 rounded-md px-4 py-2 transition-all duration-300 ${
                        isActive
                          ? "bg-slate-900 text-white scale-105"
                          : "hover:scale-105 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Link href={item.url}>
                        <span className="flex items-center space-x-2">
                          {item.icon}
                          <span>{item.title}</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
