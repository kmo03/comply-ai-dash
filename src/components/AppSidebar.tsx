import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  BarChart3,
  Upload,
  Table,
  Settings,
} from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent
        className="
          bg-secondary/50 text-foreground
          [&_[data-sidebar=menu-button]]:!text-foreground
          [&_[data-sidebar=menu-button]]:!opacity-100
          [&_[data-sidebar=menu-button][data-state=inactive]]:hover:!bg-muted
          [&_[data-sidebar=menu-button][data-state=inactive]]:hover:!text-foreground
        "
      >
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/80">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Table className="mr-2 h-4 w-4" />
                    <span>Data</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Analysis</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
