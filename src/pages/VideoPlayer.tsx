import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, GraduationCap, Eye, Download as DownloadIcon, Loader2 } from "lucide-react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { title: "Materials", url: "/materials", icon: Video },
  { title: "Videos", url: "/videos", icon: Video },
  { title: "Courses", url: "/courses", icon: Video },
  { title: "Upload", url: "/upload", icon: Video },
];

interface VideoResource {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  duration?: number;
  views: number;
  downloads: number;
  created_at: string;
  course_id: string;
  course_name: string;
  course_code: string;
}

const VideoPlayer = () => {
  const location = useLocation();
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [video, setVideo] = useState<VideoResource | null>(null);
  const [suggestedVideos, setSuggestedVideos] = useState<VideoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the specific video
        const { data: videoData, error: videoError } = await supabase
          .from('resources')
          .select(`
            *,
            courses!inner(
              name,
              code
            )
          `)
          .eq('id', videoId)
          .eq('resource_type', 'video')
          .single();

        if (videoError) throw videoError;

        if (!videoData) {
          setError('Video not found');
          return;
        }

        const videoWithCourseInfo: VideoResource = {
          ...videoData,
          course_name: videoData.courses?.name || 'Unknown Course',
          course_code: videoData.courses?.code || 'Unknown'
        };

        setVideo(videoWithCourseInfo);

        // Fetch suggested videos from the same course
        const { data: suggestedData, error: suggestedError } = await supabase
          .from('resources')
          .select(`
            *,
            courses!inner(
              name,
              code
            )
          `)
          .eq('course_id', videoData.course_id)
          .eq('resource_type', 'video')
          .neq('id', videoId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (suggestedError) {
          console.warn('Failed to fetch suggested videos:', suggestedError);
        } else {
          const suggestedWithCourseInfo = suggestedData?.map(v => ({
            ...v,
            course_name: v.courses?.name || 'Unknown Course',
            course_code: v.courses?.code || 'Unknown'
          })) || [];
          setSuggestedVideos(suggestedWithCourseInfo);
        }

        // Increment view count
        await supabase
          .from('resources')
          .update({ views: videoData.views + 1 })
          .eq('id', videoId);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load video';
        setError(errorMessage);
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const handleDownload = async (videoResource: VideoResource) => {
    try {
      // Generate download URL
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(videoResource.file_path);
      
      // Create download link
      const link = document.createElement('a');
      link.href = data.publicUrl;
      link.download = videoResource.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Increment download count
      await supabase
        .from('resources')
        .update({ downloads: videoResource.downloads + 1 })
        .eq('id', videoResource.id);

      toast({
        title: "Download Started",
        description: `Downloading ${videoResource.title}...`,
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Failed to download video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Video Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || 'The requested video could not be found.'}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Generate video URL
  const { data: videoUrlData } = supabase.storage
    .from('resources')
    .getPublicUrl(video.file_path);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-background">
        <Sidebar className="w-64 flex-shrink-0">
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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border flex items-center px-4 sm:px-6 shadow-sm bg-white sm:bg-card relative">
            <button onClick={() => navigate(-1)} className="mr-2 sm:mr-4 p-2 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/public/placeholder.svg" alt="Logo" className="block sm:hidden h-8 w-8" />
              <h1 className="text-2xl font-bold text-foreground break-words truncate max-w-full">{video.title}</h1>
            </div>
          </header>
          <main className="flex-1 p-8 bg-muted/30 flex flex-col lg:flex-row gap-8 min-w-0">
            <div className="flex-1 min-w-0">
              <video 
                controls 
                className="w-full rounded-lg shadow-lg mb-4" 
                src={videoUrlData.publicUrl}
                poster={video.thumbnail_url}
              >
                  Your browser does not support the video tag.
                </video>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {video.course_name} ({video.course_code})
                  </p>
                  {video.description && (
                    <p className="text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">
                      {video.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <DownloadIcon className="h-4 w-4" />
                    {video.downloads} downloads
                  </span>
                  <span>{formatFileSize(video.file_size)}</span>
                  {video.duration && (
                    <span>{formatDuration(video.duration)}</span>
                  )}
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <aside className="w-full lg:w-80">
              <h2 className="text-lg font-semibold mb-4">Suggested Videos</h2>
              <div className="space-y-4">
                {suggestedVideos.length === 0 && (
                  <div className="text-muted-foreground">No other videos for this course.</div>
                )}
                {suggestedVideos.map((v) => (
                  <Card key={v.id} className="flex flex-row items-center gap-4 p-2">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold break-words truncate max-w-full overflow-hidden">{v.title}</div>
                      <div className="text-xs text-muted-foreground break-words max-w-full whitespace-normal overflow-hidden">
                        {v.course_name} ({v.course_code})
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center justify-center gap-2 mb-1" 
                        onClick={() => navigate(`/videos/${v.id}`)}
                      >
                        <Eye className="h-4 w-4" /> View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => handleDownload(v)}
                      >
                          <DownloadIcon className="h-4 w-4" /> Download
                        </Button>
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