'use client'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import { redirect, usePathname } from "next/navigation"

export default function DashboardLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const isMobile = useIsMobile() // Obtiene el estado de la barra lateral
  const user = useUser()
  const pathName = usePathname()

  const adminRoutes = ['/dashboard','/dashboard/users']
  const isInAdminRoute = adminRoutes.includes(pathName)

  if (user && user.role!='ADMIN' &&isInAdminRoute) return redirect('/dashboard/solicitudes')
  return (
    <div
      className={cn('flex', {
        'debug-screens': process.env.NODE_ENV === 'development'
      })}
    >
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />

        {!isMobile ?<SidebarTogglePosition />:<SidebarTrigger/>} {/* Añadido un componente para el Trigger */}
        
        <main className="flex-1 flex justify-center">
          <div className="p-8 w-full max-w-5xl">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}

// Componente para manejar la posición del Trigger
function SidebarTogglePosition() {
  const { open } = useSidebar() // Obtiene el estado de la barra lateral


  return (
    <SidebarTrigger
      className={cn(
        "fixed top-4 z-50 transition-all duration-300", // Animación suave
        {
          "left-4": !open, // Cuando está cerrada, en la esquina izquierda
          "left-[16rem]": open // Cuando está abierta, a la derecha de la barra
        }
      )}
    />
  )
}
