import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Layers, BookOpen, Video, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useResources, Resource } from "@/lib/useResources";

const navItems = [
  { title: "Materials", url: "/materials", icon: Layers },
  { title: "Videos", url: "/videos", icon: Layers },
  { title: "Courses", url: "/courses", icon: Layers },
  { title: "Upload", url: "/upload", icon: Layers },
];

const CourseDetails = () => {
  const location = useLocation();
  const { courseId: courseProgramParam } = useParams();
  const course_program = decodeURIComponent(courseProgramParam || "");
  const navigate = useNavigate();
  const { fetchMaterialsWithCourseProgram, fetchVideosWithCourseProgram, getFileUrl } = useResources();
  const [materials, setMaterials] = useState<(Resource & { course_program: string })[]>([]);
  const [videos, setVideos] = useState<(Resource & { course_program: string })[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [matRes, vidRes] = await Promise.all([
        fetchMaterialsWithCourseProgram(),
        fetchVideosWithCourseProgram()
      ]);
      setMaterials((matRes.data || []).filter((mat: Resource & { course_program: string }) => mat.course_program === course_program));
      setVideos((vidRes.data || []).filter((vid: Resource & { course_program: string }) => vid.course_program === course_program));
    };
    fetchData();
  }, [fetchMaterialsWithCourseProgram, fetchVideosWithCourseProgram, course_program]);

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
              <h1 className="text-2xl font-bold text-foreground break-words max-w-full">{course_program}</h1>
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
                    <Card key={vid.id} className="flex flex-col justify-between p-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-2 w-full">
                        <img src={vid.thumbnail_url || "/public/placeholder.svg"} alt={vid.title} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 flex flex-col justify-between h-full w-full">
                          <div>
                            <div className="font-semibold break-words break-all overflow-wrap break-word w-full max-w-full whitespace-normal">{vid.title}</div>
                            <div className="text-sm text-muted-foreground break-words break-all overflow-wrap break-word w-full max-w-full whitespace-normal">{vid.description}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 w-full">
                        <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => navigate(`/videos/${vid.course_id}/${vid.id}`)}>
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <a href={getFileUrl(vid.file_path)} download target="_blank" rel="noopener noreferrer" className="w-1/2">
                          <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                            <DownloadIcon className="h-4 w-4" /> Download
                          </Button>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="materials">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.length === 0 && <div className="text-muted-foreground">No materials for this course.</div>}
                  {materials.map((mat) => (
                    <Card key={mat.id} className="flex flex-col justify-between p-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-2 w-full">
                        <img src={mat.thumbnail_url || "/public/placeholder.svg"} alt={mat.title} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 flex flex-col justify-between h-full w-full">
                          <div>
                            <div className="font-semibold break-words break-all overflow-wrap break-word w-full max-w-full whitespace-normal">{mat.title}</div>
                            <div className="text-sm text-muted-foreground break-words break-all overflow-wrap break-word w-full max-w-full whitespace-normal">{mat.description}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 w-full">
                        <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => window.open(getFileUrl(mat.file_path), '_blank')}>
                          <Eye className="h-4 w-4" /> View
                        </Button>
                        <a href={getFileUrl(mat.file_path)} download target="_blank" rel="noopener noreferrer" className="w-1/2">
                          <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                            <DownloadIcon className="h-4 w-4" /> Download
                          </Button>
                        </a>
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