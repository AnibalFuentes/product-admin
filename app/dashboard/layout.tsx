
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function DashboardLayout ({
    children
  }: Readonly<{
    children: React.ReactNode
  }>) {
    return (
      
        <div
          className={cn(' ', {
            'debug-screens': process.env.NODE_ENV === 'development'
          })}
        >
          
          <SidebarProvider defaultOpen={true} >
            <AppSidebar />
            <main>
              <SidebarTrigger />
          <div className='p-8 w-full'>
          
            {children}
            {/* <Toaster /> */}
          </div>
              {/* {children} */}
            </main>
          </SidebarProvider>
        </div>
     
    )
  }