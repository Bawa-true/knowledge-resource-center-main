import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  Upload, 
  TrendingUp, 
  GraduationCap,
  FileText,
  Calendar,
  BarChart3,
  Megaphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    // {
    //   title: "Total Students",
    //   value: "1,247",
    //   icon: Users,
    //   change: "+12%",
    //   description: "from last month"
    // },
    // {
    //   title: "Active Courses",
    //   value: "42",
    //   icon: BookOpen,
    //   change: "+3",
    //   description: "new this semester"
    // },
    {
      title: "Resources Uploaded",
      value: "3,891",
      icon: Upload,
      change: "+156",
      description: "this week"
    },
    // {
    //   title: "Course Completion",
    //   value: "87%",
    //   icon: TrendingUp,
    //   change: "+5%",
    //   description: "average rate"
    // }
  ];

  const recentActivities = [
    { action: "New course 'Data Structures' created", time: "2 hours ago", type: "course" },
    { action: "125 students enrolled in 'Computer Networks'", time: "4 hours ago", type: "enrollment" },
    { action: "Assignment uploaded to 'Operating Systems'", time: "6 hours ago", type: "upload" },
    { action: "Weekly report generated", time: "1 day ago", type: "report" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your educational platform.
          </p>
        </div>
        <Button variant="academic" size="lg" onClick={() => navigate("/admin/upload")}>
          <Upload className="h-5 w-5 mr-2" />
          Quick Upload
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">{stat.change}</span> {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        {/* <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Performance
            </CardTitle>
            <CardDescription>
              Overview of course completion rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Computer Networks</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Structures</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Operating Systems</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Software Engineering</span>
                <span className="text-sm text-muted-foreground">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </CardContent>
        </Card> */}

        {/* Recent Activities */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest platform activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used administrative functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Create Course</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/admin/my-uploads")}
            >
              <Upload className="h-6 w-6" />
              <span>My Uploads</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/admin/announcements")}
            >
              <Megaphone className="h-6 w-6" />
              <span>Announcements</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate("/admin/upload")}
            >
              <Upload className="h-6 w-6" />
              <span>Upload Resources</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Quick Actions */}
    </div>
  );
};

export default AdminDashboard;