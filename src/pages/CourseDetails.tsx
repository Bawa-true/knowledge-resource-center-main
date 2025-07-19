import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Layers, BookOpen, Video, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Materials", url: "/materials", icon: Layers },
  { title: "Videos", url: "/videos", icon: Layers },
  { title: "Courses", url: "/courses", icon: Layers },
  { title: "Upload", url: "/upload", icon: Layers },
];

const courses = [
  { id: "1", name: "Data Structures and Algorithms" },
  { id: "2", name: "Computer Networks" },
  { id: "3", name: "Machine Learning" },
  { id: "4", name: "Database Systems" },
];

const materialsByCourse = {
  "1": [
    { id: "m1", title: "Algebra Notes.pdf", thumbnail: "/public/placeholder.svg", description: "Comprehensive algebra notes.", fileUrl: "/public/placeholder.pdf" },
    { id: "m2", title: "Calculus Workbook.pdf", thumbnail: "/public/placeholder.svg", description: "Practice problems for calculus.", fileUrl: "/public/placeholder.pdf" }
  ],
  "2": [
    { id: "m3", title: "Network Topologies.pdf", thumbnail: "/public/placeholder.svg", description: "Overview of network topologies.", fileUrl: "/public/placeholder.pdf" }
  ],
  "3": [
    { id: "m4", title: "ML Algorithms.pdf", thumbnail: "/public/placeholder.svg", description: "Machine learning algorithms.", fileUrl: "/public/placeholder.pdf" }
  ],
  "4": [
    { id: "m5", title: "DB Design.pdf", thumbnail: "/public/placeholder.svg", description: "Database design notes.", fileUrl: "/public/placeholder.pdf" }
  ]
};

const videosByCourse = {
  "1": [
    { id: "v1", title: "Algebra Basics.mp4", thumbnail: "/public/placeholder.svg", description: "Intro to algebra basics.", fileUrl: "/public/placeholder.mp4" },
    { id: "v2", title: "Calculus Explained.mp4", thumbnail: "/public/placeholder.svg", description: "Calculus concepts explained.", fileUrl: "/public/placeholder.mp4" }
  ],
  "2": [
    { id: "v3", title: "OSI Model.mp4", thumbnail: "/public/placeholder.svg", description: "OSI model explained.", fileUrl: "/public/placeholder.mp4" }
  ],
  "3": [
    { id: "v4", title: "Intro to ML.mp4", thumbnail: "/public/placeholder.svg", description: "Introduction to machine learning.", fileUrl: "/public/placeholder.mp4" }
  ],
  "4": [
    { id: "v5", title: "ER Diagrams.mp4", thumbnail: "/public/placeholder.svg", description: "Entity-relationship diagrams.", fileUrl: "/public/placeholder.mp4" }
  ]
};

const CourseDetails = () => {
  const location = useLocation();
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);
  const materials = materialsByCourse[courseId!] || [];
  const videos = videosByCourse[courseId!] || [];
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64">
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-sidebar-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">Knowledge Center</h2>
                <p className="text-sm text-sidebar-foreground/70">Course Details</p>
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
              <h1 className="text-2xl font-bold text-foreground break-words truncate max-w-full">{course ? course.name : "Course"}</h1>
            </div>
          </header>
          <main className="flex-1 p-8 bg-muted/30">
            <Tabs defaultValue="videos" className="w-full">
              <TabsList>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>
              <TabsContent value="videos">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.length === 0 && <div className="text-muted-foreground">No videos for this course.</div>}
                  {videos.map((vid) => (
                    <Card key={vid.id} className="flex flex-row items-center gap-4 p-2">
                      <img src={vid.thumbnail} alt={vid.title} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 flex flex-col justify-between h-full">
                        <div>
                          <div className="font-semibold break-words truncate max-w-full overflow-hidden">{vid.title}</div>
                          <div className="text-sm text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">{vid.description}</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => navigate(`/videos/${courseId}/${vid.id}`)}>
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <a href={vid.fileUrl} download target="_blank" rel="noopener noreferrer" className="w-1/2">
                            <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                              <DownloadIcon className="h-4 w-4" /> Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="materials">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.length === 0 && <div className="text-muted-foreground">No materials for this course.</div>}
                  {materials.map((mat) => (
                    <Card key={mat.id} className="flex flex-row items-center gap-4 p-2">
                      <img src={mat.thumbnail} alt={mat.title} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 flex flex-col justify-between h-full">
                        <div>
                          <div className="font-semibold break-words truncate max-w-full overflow-hidden">{mat.title}</div>
                          <div className="text-sm text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">{mat.description}</div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => window.open(mat.fileUrl, '_blank')}>
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <a href={mat.fileUrl} download target="_blank" rel="noopener noreferrer" className="w-1/2">
                            <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                              <DownloadIcon className="h-4 w-4" /> Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CourseDetails; 