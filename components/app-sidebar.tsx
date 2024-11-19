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
import { signOutAccount } from "@/lib/firebase"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"

const navData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard />,
    isActive: true,
    roles: ["ADMIN"], // Solo visible para el rol ADMIN
  },
  {
    title: "Solicitudes",
    url: "/dashboard/solicitudes",
    icon: <Speech />,
    isActive: false,
    roles: ["ADMIN", "USUARIO","OPERARIO"], // Visible para ADMIN y USER
  },
  {
    title: "Usuarios",
    url: "/dashboard/users",
    icon: <Users2 />,
    isActive: false,
    roles: ["ADMIN"], // Solo visible para el rol ADMIN
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUser()

  // Filtrar las opciones de navegación según el rol del usuario
  const filteredNav = navData.filter((item) =>
    item.roles.includes(user?.role)
  )

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher /* onLogout={async() => signOutAccount()} */ />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {filteredNav.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className={item.isActive ? "bg-slate text-white" : ""}
                  >
                    <Link href={item.url}>
                    {item.icon}
                      {item.title}
                    </Link>
                    
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
