import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Materials", url: "/materials", icon: Video },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Courses", url: "/courses", icon: Video },
  { title: "Upload", url: "/upload", icon: Video },
];

const videosByCourse = {
  "1": [
    { id: "v1", title: "Algebra Basics.mp4", thumbnail: "/public/placeholder.svg", description: "Intro to algebra basics.", fileUrl: "/public/placeholder.mp4" },
    { id: "v2", title: "Calculus Explained.mp4", thumbnail: "/public/placeholder.svg", description: "Calculus concepts explained.", fileUrl: "/public/placeholder.mp4" }
  ],
  "2": [
    { id: "v3", title: "Physics Experiments.mp4", thumbnail: "/public/placeholder.svg", description: "Physics lab experiments.", fileUrl: "/public/placeholder.mp4" },
    { id: "v4", title: "Chemistry Reactions.mp4", thumbnail: "/public/placeholder.svg", description: "Chemistry in action.", fileUrl: "/public/placeholder.mp4" }
  ],
  "3": [
    { id: "v5", title: "World War II Documentary.mp4", thumbnail: "/public/placeholder.svg", description: "WWII documentary.", fileUrl: "/public/placeholder.mp4" }
  ]
};

const VideoPlayer = () => {
  const location = useLocation();
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const videos = videosByCourse[courseId!] || [];
  const video = videos.find((v) => v.id === videoId);
  const suggested = videos.filter((v) => v.id !== videoId);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-sidebar-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">Knowledge Center</h2>
                <p className="text-sm text-sidebar-foreground/70">Video Player</p>
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
                        <Link to={item.url} className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${location.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''}`}>
                          <item.icon className="h-4 w-4 text-sidebar-foreground" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 sm:px-6 shadow-sm bg-white sm:bg-card relative">
            <button onClick={() => navigate(-1)} className="mr-2 sm:mr-4 p-2 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/public/placeholder.svg" alt="Logo" className="block sm:hidden h-8 w-8" />
              <h1 className="text-2xl font-bold text-foreground break-words truncate max-w-full">{video ? video.title : "Video Player"}</h1>
            </div>
          </header>
          <main className="flex-1 p-8 bg-muted/30 flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {video ? (
                <video controls className="w-full rounded-lg shadow-lg mb-4" src={video.fileUrl} poster={video.thumbnail}>
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-muted-foreground">Video not found.</div>
              )}
              {video && (
                <div className="mt-2 text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">{video.description}</div>
              )}
            </div>
            <aside className="w-full lg:w-80">
              <h2 className="text-lg font-semibold mb-4">Suggested Videos</h2>
              <div className="space-y-4">
                {suggested.length === 0 && <div className="text-muted-foreground">No other videos for this course.</div>}
                {suggested.map((v) => (
                  <Card key={v.id} className="flex flex-row items-center gap-4 p-2">
                    <img src={v.thumbnail} alt={v.title} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold break-words truncate max-w-full overflow-hidden">{v.title}</div>
                      <div className="text-xs text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">{v.description}</div>
                    </div>
                    <div className="flex flex-col gap-2 justify-end">
                      <Button size="sm" variant="outline" className="flex items-center justify-center gap-2 mb-1" onClick={() => navigate(`/videos/${courseId}/${v.id}`)}>
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <a href={v.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="secondary" className="flex items-center justify-center gap-2">
                          <DownloadIcon className="h-4 w-4" /> Download
                        </Button>
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default VideoPlayer; 