import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Video, Layers, Upload, GraduationCap, Megaphone, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import MainSidebar from "@/components/MainSidebar";
import { useEffect, useState } from "react";
import { useResources } from "@/lib/useResources";
import { useCourses } from "@/lib/useCourses";
import { useUserProfile } from "@/lib/useUserProfile";


const stats = [
  { title: "Materials", value: "1,200+", icon: BookOpen, color: "text-blue-600" },
  { title: "Videos", value: "350+", icon: Video, color: "text-green-600" },
  { title: "Courses", value: "42", icon: Layers, color: "text-purple-600" },
  { title: "Contributors", value: "15+", icon: GraduationCap, color: "text-yellow-600" },
];

const Index = () => {
  const { fetchMaterialCount, fetchVideoCount } = useResources();
  const { fetchCourseCount } = useCourses();
  const { fetchUserCount } = useUserProfile();

  const [materialCount, setMaterialCount] = useState<number | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const [materials, videos, courses, users] = await Promise.all([
        fetchMaterialCount(),
        fetchVideoCount(),
        fetchCourseCount(),
        fetchUserCount()
      ]);
      setMaterialCount(materials.count);
      setVideoCount(videos.count);
      setCourseCount(courses.count);
      setUserCount(users.count);
      setLoading(false);
    };
    fetchCounts();
  }, [fetchMaterialCount, fetchVideoCount, fetchCourseCount, fetchUserCount]);

  const stats = [
    { title: "Materials", value: materialCount === null ? (loading ? "..." : "-") : materialCount.toLocaleString(), icon: BookOpen, color: "text-blue-600" },
    { title: "Videos", value: videoCount === null ? (loading ? "..." : "-") : videoCount.toLocaleString(), icon: Video, color: "text-green-600" },
    { title: "Courses", value: courseCount === null ? (loading ? "..." : "-") : courseCount.toLocaleString(), icon: Layers, color: "text-purple-600" },
    { title: "Contributors", value: userCount === null ? (loading ? "..." : "-") : userCount.toLocaleString(), icon: GraduationCap, color: "text-yellow-600" },
  ];

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
              <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
              <p className="text-muted-foreground text-lg">Access materials, videos, and courses, or upload new resources (admin only).</p>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="shadow-card hover:shadow-hover transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  <span className="font-medium">Dashboard</span>
                </Card>
              </Link>
              <Link to="/materials" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="font-medium">Materials</span>
                </Card>
              </Link>
              <Link to="/videos" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <Video className="h-6 w-6 text-primary" />
                  <span className="font-medium">Videos</span>
                </Card>
              </Link>
              <Link to="/courses" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <Layers className="h-6 w-6 text-primary" />
                  <span className="font-medium">Courses</span>
                </Card>
              </Link>
              <Link to="/upload" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="font-medium">Upload</span>
                </Card>
              </Link>
              <Link to="/announcements" className="block">
                <Card className="h-24 flex flex-col items-center justify-center gap-2 shadow-card hover:shadow-hover transition-all">
                  <Megaphone className="h-6 w-6 text-primary" />
                  <span className="font-medium">Announcements</span>
                </Card>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
