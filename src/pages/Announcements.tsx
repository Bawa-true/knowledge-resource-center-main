import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Megaphone, 
  BookOpen, 
  Video, 
  Layers, 
  Upload, 
  GraduationCap,
  Search,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Pin,
  LayoutDashboard
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import { useAnnouncements } from "@/lib/useAnnouncements";


const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const { announcements, loading, error } = useAnnouncements();

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (announcement.author_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || announcement.priority === filterPriority;
    const matchesAudience = filterAudience === "all" || announcement.target_audience === filterAudience;
    return matchesSearch && matchesPriority && matchesAudience;
  });

  // Optionally, show a notification in the header if there are new/pinned announcements
  // This can be done via context or a prop to Header, e.g.:
  // const hasNewAnnouncement = announcements.some(a => a.is_pinned || /* your logic for new */);
  // <Header hasNewAnnouncement={hasNewAnnouncement} />

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />High</Badge>;
      case "normal":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Info className="h-3 w-3 mr-1" />Normal</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "all":
        return <Badge variant="outline">All Users</Badge>;
      case "500 level":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">500 Level</Badge>;
      case "400 level":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">400 Level</Badge>;
      case "300 level":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">300 Level</Badge>;
      default:
        return <Badge variant="outline">All Users</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="w-64">
          <MainSidebar />
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8 bg-muted/30">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Platform Announcements</h2>
              <p className="text-muted-foreground text-lg">Stay updated with the latest news and important information.</p>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-card mb-6">
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
                <CardDescription>
                  Find specific announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Announcements</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by title, content, or author..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority-filter">Priority</Label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience-filter">Target Audience</Label>
                    <Select value={filterAudience} onValueChange={setFilterAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Audiences</SelectItem>
                        <SelectItem value="500 level">500 Level</SelectItem>
                        <SelectItem value="400 level">400 Level</SelectItem>
                        <SelectItem value="300 level">300 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id} className={`shadow-card hover:shadow-hover transition-shadow ${announcement.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {announcement.is_pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            {getPriorityBadge(announcement.priority)}
                            {getAudienceBadge(announcement.target_audience)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{announcement.author_name || announcement.author_id || "Unknown"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(announcement.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{announcement.views} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAnnouncements.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm || filterPriority !== "all" || filterAudience !== "all"
                      ? "Try adjusting your search or filters."
                      : "No announcements have been published yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Announcements; 