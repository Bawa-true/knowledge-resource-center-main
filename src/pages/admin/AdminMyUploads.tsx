import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Type definition for upload resource
interface UploadResource {
  id: string;
  title: string;
  type: "material" | "video";
  fileType: string;
  courseName: string;
  courseCode: string;
  level: string;
  semester: string;
  uploadDate: string;
  fileSize: string;
  downloads: number;
  description: string;
}

// Mock data for uploaded resources
const mockUploads: UploadResource[] = [
  {
    id: "1",
    title: "Data Structures Lecture Notes",
    type: "material",
    fileType: "pdf",
    courseName: "Data Structures and Algorithms",
    courseCode: "CS201",
    level: "200",
    semester: "first",
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
    downloads: 45,
    description: "Comprehensive lecture notes covering arrays, linked lists, and trees"
  },
  {
    id: "2",
    title: "Computer Networks Video Lecture",
    type: "video",
    fileType: "mp4",
    courseName: "Computer Networks",
    courseCode: "CS301",
    level: "300",
    semester: "second",
    uploadDate: "2024-01-10",
    fileSize: "156 MB",
    downloads: 23,
    description: "Video lecture explaining network protocols and architecture"
  },
  {
    id: "3",
    title: "Operating Systems Lab Manual",
    type: "material",
    fileType: "pdf",
    courseName: "Operating Systems",
    courseCode: "CS302",
    level: "300",
    semester: "first",
    uploadDate: "2024-01-08",
    fileSize: "1.8 MB",
    downloads: 67,
    description: "Lab exercises and practical assignments for OS course"
  },
  {
    id: "4",
    title: "Machine Learning Algorithms Demo",
    type: "video",
    fileType: "mp4",
    courseName: "Machine Learning",
    courseCode: "CS451",
    level: "400",
    semester: "second",
    uploadDate: "2024-01-05",
    fileSize: "89 MB",
    downloads: 34,
    description: "Demonstration of various ML algorithms with examples"
  },
  {
    id: "5",
    title: "Database Design Patterns",
    type: "material",
    fileType: "pptx",
    courseName: "Database Systems",
    courseCode: "CS302",
    level: "300",
    semester: "first",
    uploadDate: "2024-01-03",
    fileSize: "5.2 MB",
    downloads: 28,
    description: "PowerPoint presentation on database design patterns"
  }
];

const AdminMyUploads = () => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState(mockUploads);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [editingUpload, setEditingUpload] = useState<UploadResource | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter uploads based on search and filters
  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || upload.type === filterType;
    const matchesLevel = filterLevel === "all" || upload.level === filterLevel;
    
    return matchesSearch && matchesType && matchesLevel;
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

  const handleEdit = (upload: UploadResource) => {
    setEditingUpload(upload);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (updatedData: Partial<UploadResource>) => {
    setUploads(prev => prev.map(upload => 
      upload.id === editingUpload.id ? { ...upload, ...updatedData } : upload
    ));
    setIsEditDialogOpen(false);
    setEditingUpload(null);
    toast({
      title: "Update Successful",
      description: "Resource has been updated successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
    toast({
      title: "Delete Successful",
      description: "Resource has been deleted successfully.",
    });
  };

  const handleDownload = (upload: UploadResource) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading ${upload.title}...`,
    });
  };

  const handleView = (upload: UploadResource) => {
    // Simulate view action
    toast({
      title: "Viewing Resource",
      description: `Opening ${upload.title}...`,
    });
  };

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
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="material">Materials</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level-filter">Level</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUploads.map((upload) => (
          <Card key={upload.id} className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(upload.fileType)}
                  <div>
                    <CardTitle className="text-lg">{upload.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {upload.courseName} ({upload.courseCode})
                    </CardDescription>
                  </div>
                </div>
                {getTypeBadge(upload.type)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {upload.description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{upload.uploadDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileType className="h-3 w-3" />
                  <span>{upload.fileSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{upload.downloads} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Level {upload.level}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(upload)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(upload)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex gap-2">
                <Dialog open={isEditDialogOpen && editingUpload?.id === upload.id} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(upload)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Resource</DialogTitle>
                      <DialogDescription>
                        Update the details of your uploaded resource.
                      </DialogDescription>
                    </DialogHeader>
                    <EditUploadForm 
                      upload={editingUpload} 
                      onUpdate={handleUpdate}
                      onCancel={() => setIsEditDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the resource
                        "{upload.title}" and remove it from the platform.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(upload.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUploads.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No uploads found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterType !== "all" || filterLevel !== "all" 
                ? "Try adjusting your search or filters."
                : "You haven't uploaded any resources yet. Start by uploading your first resource."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Edit Form Component
const EditUploadForm = ({ upload, onUpdate, onCancel }: { 
  upload: UploadResource | null; 
  onUpdate: (data: Partial<UploadResource>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: upload?.title || "",
    description: upload?.description || "",
    courseName: upload?.courseName || "",
    courseCode: upload?.courseCode || "",
    level: upload?.level || "",
    semester: upload?.semester || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (!upload) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-course-name">Course Name</Label>
          <Input
            id="edit-course-name"
            value={formData.courseName}
            onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-course-code">Course Code</Label>
          <Input
            id="edit-course-code"
            value={formData.courseCode}
            onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-level">Level</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 Level</SelectItem>
              <SelectItem value="200">200 Level</SelectItem>
              <SelectItem value="300">300 Level</SelectItem>
              <SelectItem value="400">400 Level</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-semester">Semester</Label>
          <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first">First Semester</SelectItem>
              <SelectItem value="second">Second Semester</SelectItem>
              <SelectItem value="summer">Summer Session</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Resource
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AdminMyUploads; 