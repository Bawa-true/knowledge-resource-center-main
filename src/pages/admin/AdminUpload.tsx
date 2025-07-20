import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Video, Image, Archive, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/lib/useCourses";
import { validateFile, formatFileSize, ALLOWED_FILE_TYPES } from "@/lib/utils";

const AdminUpload = () => {
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
    level: "",
    semester: "",
    courseType: "",
    courseProgram: "",
    files: [] as File[],
  });
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { uploadCourseWithResources, loading, error } = useCourses();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    
    // Validate files before adding
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      }
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: invalidFiles.join(', '),
        variant: "destructive",
      });
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate files before adding
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      
      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          invalidFiles.push(`${file.name}: ${validation.error}`);
        }
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid Files",
          description: invalidFiles.join(', '),
          variant: "destructive",
        });
      }
      
      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
      }
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('video')) return <Video className="h-4 w-4" />;
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.courseName || !formData.courseCode || !formData.level || 
        !formData.semester || !formData.courseType || !formData.courseProgram) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // Validate all files before submission
    const invalidFiles = formData.files.map(file => validateFile(file)).filter(validation => !validation.isValid);
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: "Some files are invalid. Please remove them and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const courseData = {
        name: formData.courseName,
        code: formData.courseCode,
        description: formData.description,
        level: formData.level,
        semester: formData.semester,
        course_type: formData.courseType,
        course_program: formData.courseProgram,
      };

      const result = await uploadCourseWithResources(courseData, formData.files);

      if (result.error) {
        toast({
          title: "Upload Failed",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Upload Successful",
        description: `Course "${formData.courseName}" created with ${result.resources.length} resources uploaded successfully.`,
      });

      // Reset form
      setFormData({
        courseName: "",
        courseCode: "",
        description: "",
        level: "",
        semester: "",
        courseType: "",
        courseProgram: "",
        files: [],
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Resources</h1>
        <p className="text-muted-foreground">
          Upload course materials, documents, and multimedia resources.
        </p>
      </div>



      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Provide details about the course for this upload
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Data Structures and Algorithms"
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                placeholder="e.g., CS201"
                value={formData.courseCode}
                onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Enter course description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
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
              <Label htmlFor="semester">Semester *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Semester</SelectItem>
                  <SelectItem value="second">Second Semester</SelectItem>
                  <SelectItem value="summer">Summer Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseType">Course Type *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, courseType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core Course</SelectItem>
                  <SelectItem value="elective">Elective Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseProgram">Course Program *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, courseProgram: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Computer Engineering</SelectItem>
                  <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  <SelectItem value="networking">Networking & Security</SelectItem>
                  <SelectItem value="control">Control Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Maximum file size: 300MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Drag files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDFs, PowerPoints, Videos, Images, and Archives
              </p>
              <Button type="button" variant="outline" onClick={() => document.getElementById('fileInput')?.click()}>
                Select Files
              </Button>
              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept={ALLOWED_FILE_TYPES.join(',')}
              />
            </div>

            {/* Selected Files */}
            {formData.files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({formData.files.length})</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {validateFile(file).isValid ? (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Guidelines */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Upload Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Maximum file size per upload: 300MB</li>
                  <li>Supported formats: PDF, PowerPoint, Word, Videos (MP4, AVI, MOV), Images, Archives</li>
                  <li>Ensure file names are descriptive and professional</li>
                  <li>Large video files may take longer to process</li>
                  <li>All uploads are scanned for security</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" disabled={loading}>
            Save as Draft
          </Button>
          <Button type="submit" variant="academic" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Resources"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpload;