import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, GraduationCap } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";



const courses = [
  {
    id: "1",
    name: "Data Structures and Algorithms",
    code: "CSE201",
    instructor: "Dr. John Smith",
    description: "Introduction to fundamental data structures and algorithms"
  },
  {
    id: "2",
    name: "Computer Networks",
    code: "CSE301",
    instructor: "Dr. Sarah Johnson",
    description: "Network protocols, architecture, and implementation"
  },
  {
    id: "3",
    name: "Machine Learning",
    code: "CSE451",
    instructor: "Dr. Mike Chen",
    description: "Introduction to machine learning algorithms and applications"
  },
  {
    id: "4",
    name: "Database Systems",
    code: "CSE302",
    instructor: "Dr. Emily Brown",
    description: "Database design, implementation, and management"
  }
];

const Courses = () => {
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
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="shadow-card cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />{course.name} <span className="text-gray-500 text-base">({course.code})</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-1">Instructor: {course.instructor}</p>
                    <p className="text-gray-600">{course.description}</p>
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

export default Courses;