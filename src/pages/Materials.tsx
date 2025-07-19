import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";



const materialsByCourse = {
  "Math": [
    { id: "m1", title: "Algebra Notes.pdf", thumbnail: "/public/placeholder.svg", description: "Comprehensive algebra notes.", fileUrl: "/public/placeholder.pdf" },
    { id: "m2", title: "Calculus Workbook.pdf", thumbnail: "/public/placeholder.svg", description: "Practice problems for calculus.", fileUrl: "/public/placeholder.pdf" }
  ],
  "Science": [
    { id: "m3", title: "Physics Lab Manual.pdf", thumbnail: "/public/placeholder.svg", description: "Lab experiments for physics.", fileUrl: "/public/placeholder.pdf" },
    { id: "m4", title: "Chemistry Formulas.pdf", thumbnail: "/public/placeholder.svg", description: "Key chemistry formulas.", fileUrl: "/public/placeholder.pdf" }
  ],
  "History": [
    { id: "m5", title: "World War II Summary.pdf", thumbnail: "/public/placeholder.svg", description: "Summary of WWII events.", fileUrl: "/public/placeholder.pdf" }
  ]
};

const Materials = () => {
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
              {Object.entries(materialsByCourse).map(([course, materials]) => (
                <Card key={course} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{course}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {materials.map((mat) => (
                        <Card key={mat.id} className="flex flex-col justify-between p-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-2 w-full">
                            <img src={mat.thumbnail} alt={mat.title} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1 flex flex-col justify-between h-full w-full">
                              <div>
                                <div className="font-semibold break-words text-wrap truncate max-w-full overflow-hidden">{mat.title}</div>
                                <div className="text-sm text-muted-foreground text-wrap break-words max-w-full whitespace-normal overflow-hidden">{mat.description}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 w-full">
                              <Button size="sm" variant="outline" className="w-1/2 flex items-center justify-center gap-2" onClick={() => window.open(mat.fileUrl, '_blank')}>
                                <Eye className="h-4 w-4" /> View
                              </Button>
                              <a href={mat.fileUrl} download target="_blank" rel="noopener noreferrer" className="w-1/2">
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

export default Materials; 