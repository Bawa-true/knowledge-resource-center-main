import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  Filter,
  Pin
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

// Debug: Add console log to check if component loads
console.log("AdminAnnouncements component loaded");

// Type definition for announcement
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  targetAudience: "all" | "500 level" | "400 level" | "300 level";
  status: "active" | "inactive" | "expired";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
  author: string;
  views: number;
}

// Mock data for announcements
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Notice",
    content: "The platform will be undergoing scheduled maintenance on Saturday, January 20th, from 2:00 AM to 6:00 AM. During this time, users may experience temporary service interruptions. We apologize for any inconvenience.",
    priority: "high",
    targetAudience: "all",
    status: "active",
    isPinned: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    expiryDate: "2024-01-21T00:00:00Z",
    author: "System Administrator",
    views: 245
  },
  {
    id: "2",
    title: "New Course Materials Available",
    content: "New lecture materials for CS301 (Computer Networks) have been uploaded. Students are encouraged to review the updated course content and download the latest resources.",
    priority: "normal",
    targetAudience: "500 level",
    status: "active",
    isPinned: false,
    createdAt: "2024-01-14T14:15:00Z",
    updatedAt: "2024-01-14T14:15:00Z",
    author: "Dr. Sarah Johnson",
    views: 189
  },
  {
    id: "3",
    title: "Faculty Meeting Reminder",
    content: "Reminder: Faculty meeting scheduled for Friday, January 19th at 3:00 PM in the Conference Room. Agenda includes curriculum updates and upcoming semester planning.",
    priority: "normal",
    targetAudience: "400 level",
    status: "active",
    isPinned: false,
    createdAt: "2024-01-13T09:45:00Z",
    updatedAt: "2024-01-13T09:45:00Z",
    expiryDate: "2024-01-19T18:00:00Z",
    author: "Department Head",
    views: 67
  },
  {
    id: "4",
    title: "Emergency: Server Issues Resolved",
    content: "The server issues that occurred earlier today have been resolved. All services are now running normally. Thank you for your patience.",
    priority: "urgent",
    targetAudience: "all",
    status: "active",
    isPinned: true,
    createdAt: "2024-01-12T16:20:00Z",
    updatedAt: "2024-01-12T16:20:00Z",
    author: "IT Support Team",
    views: 312
  },
  {
    id: "5",
    title: "Holiday Schedule Update",
    content: "The university will be closed for the upcoming holiday weekend. All online services will remain available, but administrative offices will be closed from Friday to Monday.",
    priority: "low",
    targetAudience: "all",
    status: "active",
    isPinned: false,
    createdAt: "2024-01-10T11:00:00Z",
    updatedAt: "2024-01-10T11:00:00Z",
    expiryDate: "2024-01-25T00:00:00Z",
    author: "Administration",
    views: 156
  }
];

const AdminAnnouncements = () => {
  // Debug: Add console log to check if component renders
  console.log("AdminAnnouncements component rendering");
  
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  // Form state for new announcement
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    targetAudience: "all" | "500 level" | "400 level" | "300 level";
    expiryDate: string;
    isPinned: boolean;
  }>({
    title: "",
    content: "",
    priority: "normal",
    targetAudience: "all",
    expiryDate: "",
    isPinned: false
  });

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || announcement.priority === filterPriority;
    const matchesAudience = filterAudience === "all" || announcement.targetAudience === filterAudience;
    const matchesStatus = filterStatus === "all" || announcement.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesAudience && matchesStatus;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />High</Badge>;
      case "normal":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Info className="h-3 w-3 mr-1" />Normal</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "all":
        return <Badge variant="outline">All Users</Badge>;
      case "500 level":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">500 Level</Badge>;
      case "400 level":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">400 Level</Badge>;
      case "300 level":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">300 Level</Badge>;
      default:
        return <Badge variant="outline">All Users</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "expired":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">Active</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreate = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and content fields.",
        variant: "destructive",
      });
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      targetAudience: newAnnouncement.targetAudience,
      status: "active",
      isPinned: newAnnouncement.isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiryDate: newAnnouncement.expiryDate || undefined,
      author: "Current User",
      views: 0
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setIsCreateDialogOpen(false);
    setNewAnnouncement({
      title: "",
      content: "",
      priority: "normal",
      targetAudience: "all",
      expiryDate: "",
      isPinned: false
    });
    toast({
      title: "Announcement Created",
      description: "Your announcement has been published successfully.",
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (updatedData: Partial<Announcement>) => {
    if (!editingAnnouncement) return;

    const updatedAnnouncement: Announcement = {
      ...editingAnnouncement,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === editingAnnouncement.id ? updatedAnnouncement : announcement
    ));
    setIsEditDialogOpen(false);
    setEditingAnnouncement(null);
    toast({
      title: "Announcement Updated",
      description: "The announcement has been updated successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    toast({
      title: "Announcement Deleted",
      description: "The announcement has been deleted successfully.",
    });
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === id 
        ? { ...announcement, isPinned: !announcement.isPinned, updatedAt: new Date().toISOString() }
        : announcement
    ));
    toast({
      title: "Pin Status Updated",
      description: "The announcement pin status has been updated.",
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setAnnouncements(prev => prev.map(announcement => 
      announcement.id === id 
        ? { ...announcement, status: newStatus as "active" | "inactive", updatedAt: new Date().toISOString() }
        : announcement
    ));
    toast({
      title: "Status Updated",
      description: `Announcement status changed to ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage platform announcements for students and faculty
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="academic" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to communicate with users on the platform.
              </DialogDescription>
            </DialogHeader>
            <CreateAnnouncementForm 
              announcement={newAnnouncement}
              setAnnouncement={setNewAnnouncement}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific announcements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Announcements</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, content, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience-filter">Target Audience</Label>
              <Select value={filterAudience} onValueChange={setFilterAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="500 level">500 Level</SelectItem>
                  <SelectItem value="400 level">400 Level</SelectItem>
                  <SelectItem value="300 level">300 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className={`shadow-card hover:shadow-hover transition-shadow ${announcement.isPinned ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {announcement.isPinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {getPriorityBadge(announcement.priority)}
                      {getAudienceBadge(announcement.targetAudience)}
                      {getStatusBadge(announcement.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{announcement.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(announcement.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{announcement.views} views</span>
                      </div>
                      {announcement.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Expires: {formatDate(announcement.expiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                {announcement.content}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePin(announcement.id)}
                >
                  {announcement.isPinned ? (
                    <>
                      <Pin className="h-4 w-4 mr-1" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-1" />
                      Pin
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                >
                  {announcement.status === "active" ? "Deactivate" : "Activate"}
                </Button>

                <Dialog open={isEditDialogOpen && editingAnnouncement?.id === announcement.id} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Edit Announcement</DialogTitle>
                      <DialogDescription>
                        Update the announcement details.
                      </DialogDescription>
                    </DialogHeader>
                    <EditAnnouncementForm 
                      announcement={editingAnnouncement} 
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
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the announcement
                        "{announcement.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(announcement.id)}
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

      {filteredAnnouncements.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterPriority !== "all" || filterAudience !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "No announcements have been created yet. Start by creating your first announcement."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Create Form Component
const CreateAnnouncementForm = ({ 
  announcement, 
  setAnnouncement, 
  onSubmit, 
  onCancel 
}: { 
  announcement: {
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    targetAudience: "all" | "500 level" | "400 level" | "300 level";
    expiryDate: string;
    isPinned: boolean;
  }; 
  setAnnouncement: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    targetAudience: "all" | "500 level" | "400 level" | "300 level";
    expiryDate: string;
    isPinned: boolean;
  }>>; 
  onSubmit: () => void; 
  onCancel: () => void;
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="create-title">Title *</Label>
        <Input
          id="create-title"
          placeholder="Enter announcement title..."
          value={announcement.title}
          onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="create-content">Content *</Label>
        <Textarea
          id="create-content"
          placeholder="Enter announcement content..."
          value={announcement.content}
          onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
          rows={6}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="create-priority">Priority</Label>
          <Select value={announcement.priority} onValueChange={(value) => setAnnouncement({ ...announcement, priority: value as "low" | "normal" | "high" | "urgent" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="create-audience">Target Audience</Label>
          <Select value={announcement.targetAudience} onValueChange={(value) => setAnnouncement({ ...announcement, targetAudience: value as "all" | "500 level" | "400 level" | "300 level" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="500 level">500 Level</SelectItem>
              <SelectItem value="400 level">400 Level</SelectItem>
              <SelectItem value="300 level">300 Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="create-expiry">Expiry Date (Optional)</Label>
          <Input
            id="create-expiry"
            type="datetime-local"
            value={announcement.expiryDate}
            onChange={(e) => setAnnouncement({ ...announcement, expiryDate: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={announcement.isPinned}
              onChange={(e) => setAnnouncement({ ...announcement, isPinned: e.target.checked })}
              className="rounded"
            />
            Pin to Top
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Announcement
        </Button>
      </DialogFooter>
    </form>
  );
};

// Edit Form Component
const EditAnnouncementForm = ({ 
  announcement, 
  onUpdate, 
  onCancel 
}: { 
  announcement: Announcement | null; 
  onUpdate: (data: Partial<Announcement>) => void; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
    priority: announcement?.priority || "normal",
    targetAudience: announcement?.targetAudience || "all",
    expiryDate: announcement?.expiryDate ? announcement.expiryDate.split('T')[0] + 'T' + announcement.expiryDate.split('T')[1].substring(0, 5) : "",
    isPinned: announcement?.isPinned || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (!announcement) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title *</Label>
        <Input
          id="edit-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-content">Content *</Label>
        <Textarea
          id="edit-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "normal" | "high" | "urgent" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-audience">Target Audience</Label>
          <Select value={formData.targetAudience} onValueChange={(value) => setFormData({ ...formData, targetAudience: value as "all" | "500 level" | "400 level" | "300 level" })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="500 level">500 Level</SelectItem>
              <SelectItem value="400 level">400 Level</SelectItem>
              <SelectItem value="300 level">300 Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-expiry">Expiry Date (Optional)</Label>
          <Input
            id="edit-expiry"
            type="datetime-local"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded"
            />
            Pin to Top
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Announcement
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AdminAnnouncements; 