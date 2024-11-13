import * as React from "react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
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
} from "@/components/ui/sidebar"
import { LayoutDashboard, Speech, Users2 } from "lucide-react"

// Definir solo los elementos necesarios
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true, // Indicador de estado activo
    },
    {
      title: "Solicitudes",
      url: "/dashboard/solicitudes",
      icon: <Speech />,
      isActive: false,
    },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: <Users2 />,
      isActive: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive} // Pasar el estado activo
                    className={item.isActive ? "bg-slate text-white" : ""} // Agregar la clase de fondo
                  >
                    <a href={item.url}>
                      {item.icon} {/* Muestra el ícono */}
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
