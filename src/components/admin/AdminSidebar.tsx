import { NavLink, useLocation } from "react-router-dom";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Users,
  Settings,
  GraduationCap,
  Calendar,
  BarChart3,
  FileText,
  Megaphone,
} from "lucide-react";
import { useSupabaseAuth } from "@/lib";
import { useUserProfile } from "@/lib";
import { useEffect } from "react";

const baseAdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  // { title: "Courses", url: "/admin/courses", icon: BookOpen },
  // { title: "Schedules", url: "/admin/schedules", icon: Calendar },
  { title: "Upload Resources", url: "/admin/upload", icon: Upload },
  { title: "My Uploads", url: "/admin/my-uploads", icon: Users },
  // { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const { user } = useSupabaseAuth();
  const { profile, fetchProfile } = useUserProfile();

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Add Users page link only for admin role
  const adminItems = [...baseAdminItems];
  if (profile?.role === "Admin") {
    adminItems.splice(1, 0, { title: "Users", url: "/admin/users", icon: Users });
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-sidebar-foreground" />
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">EduTech</h2>
              <p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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