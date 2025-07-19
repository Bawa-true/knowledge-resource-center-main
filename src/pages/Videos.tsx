import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";



const videosByCourse = {
  "Math": [
    { id: "v1", title: "Algebra Basics.mp4", thumbnail: "/public/placeholder.svg", description: "Intro to algebra basics.", fileUrl: "/public/placeholder.mp4" },
    { id: "v2", title: "Calculus Explained.mp4", thumbnail: "/public/placeholder.svg", description: "Calculus concepts explained.", fileUrl: "/public/placeholder.mp4" }
  ],
  "Science": [
    { id: "v3", title: "Physics Experiments.mp4", thumbnail: "/public/placeholder.svg", description: "Physics lab experiments.", fileUrl: "/public/placeholder.mp4" },
    { id: "v4", title: "Chemistry Reactions.mp4", thumbnail: "/public/placeholder.svg", description: "Chemistry in action.", fileUrl: "/public/placeholder.mp4" }
  ],
  "History": [
    { id: "v5", title: "World War II Documentary.mp4", thumbnail: "/public/placeholder.svg", description: "WWII documentary.", fileUrl: "/public/placeholder.mp4" }
  ]
};

const courseNameToId = {
  "Math": "1",
  "Science": "2",
  "History": "3"
};

const Videos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64">
          <MainSidebar />
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(videosByCourse).map(([course, videos]) => (
                <Card key={course} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary" />{course}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {videos.map((vid) => (
                        
                        <Card key={vid.id} className="flex flex-col justify-between p-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-2 w-full">
                            <img src={vid.thumbnail} alt={vid.title} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1 flex flex-col justify-between h-full w-full">
                              <div>
                                <div className="font-semibold break-words text-wrap truncate max-w-full overflow-hidden">{vid.title}</div>
                                <div className="text-sm text-muted-foreground break-words max-w-full text-warp whitespace-normal overflow-hidden">{vid.description}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 w-full">
                            <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => navigate(`/videos/${courseNameToId[course]}/${vid.id}`)}>
                              <Eye className="h-4 w-4" /> View
                            </Button>
                            <a href={vid.fileUrl} download target="_blank" rel="noopener noreferrer" className="w-1/2">
                              <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                                <DownloadIcon className="h-4 w-4" /> Download
                              </Button>
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Videos; 