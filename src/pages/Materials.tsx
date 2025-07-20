import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, GraduationCap, Eye, Download as DownloadIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import { useEffect, useState } from "react";
import { useResources } from "@/lib/useResources";
import type { Resource } from "@/lib/useResources";


const Materials = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchMaterialsWithCourseProgram, getFileUrl, loading } = useResources();
  const [materialsByProgram, setMaterialsByProgram] = useState<Record<string, (Resource & { course_program: string })[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchMaterialsWithCourseProgram();
      if (data) {
        // Group by course_program
        const grouped: Record<string, (Resource & { course_program: string })[]> = {};
        data.forEach((mat: Resource & { course_program: string }) => {
          const program = mat.course_program || "Other";
          if (!grouped[program]) grouped[program] = [];
          grouped[program].push(mat);
        });
        setMaterialsByProgram(grouped);
      }
    };
    fetchData();
  }, [fetchMaterialsWithCourseProgram]);

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
              {Object.entries(materialsByProgram).map(([course_program, materials]) => (
                <Card key={course_program} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />{course_program}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {materials.map((mat) => (
                        <Card key={mat.id} className="flex flex-col justify-between p-4">
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-2 w-full">
                            <img src={mat.thumbnail_url || "/public/placeholder.svg"} alt={mat.title} className="w-16 h-16 text-wrap text-ellipsis object-cover rounded" />
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