import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Upload, 
  FileBarChart, 
  Settings,
  Users,
  TrendingUp
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Results", url: "/results", icon: FileBarChart },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      {/* set a readable default text color on the whole sidebar */}
      <SidebarContent className="bg-secondary/50 text-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/90 font-medium mb-2">
            BEE Compliance
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          // force readable default + full opacity; use hover overrides for hover state
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm font-medium !opacity-100"
                            : "!text-foreground/90 !opacity-100 hover:!bg-muted hover:!text-foreground"
                        ].join(" ")
                      }
                    >
                      {/* lucide icons inherit currentColor by default */}
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="leading-none">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
