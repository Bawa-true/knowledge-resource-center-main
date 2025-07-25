import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { BookOpen, Video, Layers, Upload, GraduationCap, Megaphone, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Materials", url: "/materials", icon: BookOpen },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Courses", url: "/courses", icon: Layers },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const MainSidebar = () => {
  const location = useLocation();

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-sidebar-foreground" />
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">E-Access</h2>
            <p className="text-sm text-sidebar-foreground/70">Main Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        location.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

export default MainSidebar; 