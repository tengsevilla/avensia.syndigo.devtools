import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ReactNode } from "react"
import DynamicBreadcrumb from "./DynamicBreadcrumb";
import { Badge } from "./ui/badge";

interface RootLayoutProps {
  children: ReactNode
}

export default function Page({ children }: RootLayoutProps) {
  const tenantIndicator = (process.env.NEXT_PUBLIC_TENANT === "DEV") ? "bg-blue-500 text-white"
    : (process.env.NEXT_PUBLIC_TENANT === "QA/PREPROD") ? "bg-orange-500 text-white" : "bg-red-500 text-white";
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DynamicBreadcrumb />
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={'outline'} className={tenantIndicator}>{process.env.NEXT_PUBLIC_TENANT}</Badge>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
