import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Megaphone, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications, Notification as DBNotification } from "@/lib/useNotifications";
import { supabase } from "@/lib/supabase";

// Type definition for notification
// interface Notification { ... } // Now imported from useNotifications

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    user_id: "mock-user-1",
    title: "System Maintenance Notice",
    message: "Platform maintenance scheduled for Saturday",
    priority: "high" as const,
    type: "system",
    created_at: "2 hours ago",
    is_read: false
  },
  {
    id: "2",
    user_id: "mock-user-2",
    title: "New Course Materials",
    message: "CS301 materials have been updated",
    priority: "normal" as const,
    type: "course",
    created_at: "1 day ago",
    is_read: false
  },
  {
    id: "3",
    user_id: "mock-user-3",
    title: "Server Issues Resolved",
    message: "All services are now running normally",
    priority: "urgent" as const,
    type: "system",
    created_at: "3 days ago",
    is_read: true
  }
];

const Header = () => {
  const navigate = useNavigate();
  const { notifications, loading, error, fetchNotifications } = useNotifications();
  const [localNotifications, setLocalNotifications] = useState(mockNotifications);

  // Use real notifications if loaded, else fallback to mock
  const displayNotifications = !loading && !error && notifications.length > 0 ? notifications : localNotifications;

  const unreadCount = displayNotifications.filter(n => !n.is_read).length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = (notification: DBNotification) => {
    // Mark as read (local only for now)
    setLocalNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    );
    // Navigate to announcements page
    navigate("/announcements");
  };

  const markAllAsRead = async () => {
    // Mark all as read in the database
    if (!loading && !error && notifications.length > 0) {
      const ids = notifications.filter(n => !n.is_read).map(n => n.id);
      if (ids.length > 0) {
        await Promise.all(ids.map(id =>
          supabase.from('notifications').update({ is_read: true }).eq('id', id)
        ));
        // Optionally, re-fetch notifications from the DB
        fetchNotifications();
      }
    }
    // Mark all as read in local state (for mock fallback)
    setLocalNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Knowledge Resource Center</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="h-6 px-2 text-xs"
                >
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.created_at}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="text-center py-4">
                <p className="text-sm text-muted-foreground">No notifications</p>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate("/announcements")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Megaphone className="h-4 w-4" />
              <span>View all announcements</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header; 