import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Archive, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter,
  Calendar,
  FileType,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMyUploads, type UploadedResource } from "@/lib/useMyUploads";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file extension from MIME type
const getFileExtension = (mimeType: string): string => {
  const extensions: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/quicktime': 'mov',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
  };
  return extensions[mimeType] || 'file';
};

const AdminMyUploads = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  const { resources, loading, error, deleteResource } = useMyUploads();

  // Filter uploads based on search and filters
  const filteredUploads = resources.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || upload.resource_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'pptx': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'mp4': return <Video className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <Image className="h-5 w-5 text-green-500" />;
      case 'zip':
      case 'rar': return <Archive className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "video" ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        <Video className="h-3 w-3 mr-1" />
        Video
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <FileText className="h-3 w-3 mr-1" />
        Material
      </Badge>
    );
  };

  const handleDelete = async (id: string) => {
    const success = await deleteResource(id);
    if (success) {
    toast({
      title: "Delete Successful",
      description: "Resource has been deleted successfully.",
    });
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (upload: UploadedResource) => {
    // Generate download URL
    const { data } = supabase.storage
      .from('resources')
      .getPublicUrl(upload.file_path);
    
    // Create download link
    const link = document.createElement('a');
    link.href = data.publicUrl;
    link.download = upload.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `Downloading ${upload.title}...`,
    });
  };

  const handleView = (upload: UploadedResource) => {
    if (upload.resource_type === 'video') {
      // Navigate to video player for videos
      navigate(`/videos/${upload.id}`);
    } else {
      // Open in new tab for other file types
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(upload.file_path);
      
      window.open(data.publicUrl, '_blank');
    }
    
    toast({
      title: "Viewing Resource",
      description: `Opening ${upload.title}...`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your uploads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Uploads</h1>
          <p className="text-muted-foreground">
            Manage all your uploaded materials and videos
          </p>
        </div>
        <Button variant="academic" size="lg" onClick={() => navigate("/admin/upload")}>
          <Upload className="h-5 w-5 mr-2" />
          Upload New Resource
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific resources from your uploads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Resources</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by title, course name, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Resource Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="material">Materials</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploads List */}
      <Card className="shadow-card">
            <CardHeader>
          <CardTitle>Your Uploads ({filteredUploads.length})</CardTitle>
          <CardDescription>
            All resources you have uploaded to the platform
                    </CardDescription>
            </CardHeader>
        <CardContent>
          {filteredUploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No uploads found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filters"
                  : "You haven't uploaded any resources yet"
                }
              </p>
              {!searchTerm && filterType === "all" && (
                <Button onClick={() => navigate("/admin/upload")}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Resource
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getFileIcon(getFileExtension(upload.file_type))}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{upload.title}</h3>
                        {getTypeBadge(upload.resource_type)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {upload.course_name} ({upload.course_code})
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                          {new Date(upload.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                  <FileType className="h-3 w-3" />
                          {formatFileSize(upload.file_size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {upload.views} views
                        </span>
                        <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                          {upload.downloads} downloads
                        </span>
                </div>
                </div>
              </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(upload)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(upload)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                      <AlertDialogDescription>
                            Are you sure you want to delete "{upload.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(upload.id)}
                            className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
                </div>
        ))}
      </div>
          )}
          </CardContent>
        </Card>
    </div>
  );
};

export default AdminMyUploads; 