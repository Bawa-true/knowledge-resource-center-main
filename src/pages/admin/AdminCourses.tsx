import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, GraduationCap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import { useEffect, useState } from "react";
import { useCourses, CourseData } from "@/lib/useCourses";


const AdminCourses = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchAllCourses } = useCourses();
  const [courses, setCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchAllCourses();
      if (data) setCourses(data);
    };
    fetchData();
  }, [fetchAllCourses]);

  // Deduplicate by course_program
  const uniqueCourses = Object.values(
    courses.reduce((acc, course) => {
      if (!acc[course.course_program]) {
        acc[course.course_program] = course;
      }
      return acc;
    }, {} as Record<string, CourseData>)
  );

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
              {uniqueCourses.map((course) => (
                <Card
                  key={course.course_program}
                  className="shadow-card cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                  onClick={() => navigate(`/courses/${encodeURIComponent(course.course_program)}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />{course.course_program}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{course.course_program} materials are available enjoy your studies</p>
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

export default AdminCourses;