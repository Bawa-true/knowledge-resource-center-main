import { useState, useEffect } from "react";
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
  Pin,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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

// Type definition for announcement
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  target_audience: "all" | "500 level" | "400 level" | "300 level";
  status: "active" | "inactive" | "expired";
  is_pinned: boolean;
  author_id?: string;
  author_name?: string;
  expiry_date?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state for new announcement
  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    target_audience: "all" | "500 level" | "400 level" | "300 level";
    expiry_date: string;
    is_pinned: boolean;
  }>({
    title: "",
    content: "",
    priority: "normal",
    target_audience: "all",
    expiry_date: "",
    is_pinned: false
  });

  // Fetch announcements from database
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      // First, fetch all announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Then, fetch all unique author IDs
      const authorIds = [...new Set(announcementsData?.map(a => a.author_id).filter(Boolean) || [])];
      
      // Fetch user data for all authors
      let usersData: { id: string; name: string; email: string }[] = [];
      if (authorIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', authorIds);
        
        if (usersError) {
          console.warn('Error fetching users:', usersError);
        } else {
          usersData = users || [];
        }
      }

      // Combine announcements with user data
      const announcementsWithAuthor = announcementsData?.map(announcement => {
        const author = usersData.find(user => user.id === announcement.author_id);
        return {
          ...announcement,
          author_name: author?.name || author?.email || 'Unknown Author'
        };
      }) || [];

      setAnnouncements(announcementsWithAuthor);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      
      // More detailed error handling
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        const supabaseError = error as Record<string, unknown>;
        if (supabaseError.message) {
          errorMessage = String(supabaseError.message);
        } else if (supabaseError.error) {
          errorMessage = String(supabaseError.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to load announcements: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (announcement.author_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || announcement.priority === filterPriority;
    const matchesAudience = filterAudience === "all" || announcement.target_audience === filterAudience;
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

  const handleCreate = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in the title and content fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create announcements.",
          variant: "destructive",
        });
        return;
      }

            const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        target_audience: newAnnouncement.target_audience,
        is_pinned: newAnnouncement.is_pinned,
        author_id: user.id,
        expiry_date: newAnnouncement.expiry_date || null,
        status: 'active'
      };

      console.log('Attempting to create announcement with data:', announcementData);

      const { data, error } = await supabase
        .from('announcements')
        .insert(announcementData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      // Add notification for the new announcement
      if (data && data.id) {
        const notification = {
          user_id: null, // null or a broadcast user, or handle per-user if needed
          title: `New Announcement: ${data.title}`,
          message: data.content,
          priority: data.priority,
          type: 'announcement',
          related_id: data.id,
          is_read: false
        };
        await supabase.from('notifications').insert(notification);
      }

    setIsCreateDialogOpen(false);
    setNewAnnouncement({
      title: "",
      content: "",
      priority: "normal",
        target_audience: "all",
        expiry_date: "",
        is_pinned: false
      });

    toast({
      title: "Announcement Created",
      description: "Your announcement has been published successfully.",
    });

      // Refresh the list
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      
      // More detailed error handling
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        const supabaseError = error as Record<string, unknown>;
        if (supabaseError.message) {
          errorMessage = String(supabaseError.message);
        } else if (supabaseError.error) {
          errorMessage = String(supabaseError.error);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to create announcement: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (updatedData: Partial<Announcement>) => {
    if (!editingAnnouncement) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('announcements')
        .update({
          title: updatedData.title,
          content: updatedData.content,
          priority: updatedData.priority,
          target_audience: updatedData.target_audience,
          is_pinned: updatedData.is_pinned,
          expiry_date: updatedData.expiry_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAnnouncement.id);

      if (error) throw error;

    setIsEditDialogOpen(false);
    setEditingAnnouncement(null);
      
    toast({
      title: "Announcement Updated",
      description: "The announcement has been updated successfully.",
    });

      // Refresh the list
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;

    toast({
      title: "Announcement Deleted",
      description: "The announcement has been deleted successfully.",
    });

      // Refresh the list
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          is_pinned: !currentPinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

    toast({
      title: "Pin Status Updated",
      description: "The announcement pin status has been updated.",
    });

      // Refresh the list
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating pin status:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          status: newStatus as "active" | "inactive",
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

    toast({
      title: "Status Updated",
      description: `Announcement status changed to ${newStatus}.`,
    });

      // Refresh the list
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    );
  }

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
              isSubmitting={isSubmitting}
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
          <Card key={announcement.id} className={`shadow-card hover:shadow-hover transition-shadow ${announcement.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {announcement.is_pinned && <Pin className="h-4 w-4 text-primary mt-1" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {getPriorityBadge(announcement.priority)}
                      {getAudienceBadge(announcement.target_audience)}
                      {getStatusBadge(announcement.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{announcement.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{announcement.views} views</span>
                      </div>
                      {announcement.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Expires: {formatDate(announcement.expiry_date)}</span>
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
                  onClick={() => handleTogglePin(announcement.id, announcement.is_pinned)}
                >
                  {announcement.is_pinned ? (
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
                      isSubmitting={isSubmitting}
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
  onCancel,
  isSubmitting
}: { 
  announcement: {
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    target_audience: "all" | "500 level" | "400 level" | "300 level";
    expiry_date: string;
    is_pinned: boolean;
  }; 
  setAnnouncement: React.Dispatch<React.SetStateAction<{
    title: string;
    content: string;
    priority: "low" | "normal" | "high" | "urgent";
    target_audience: "all" | "500 level" | "400 level" | "300 level";
    expiry_date: string;
    is_pinned: boolean;
  }>>; 
  onSubmit: () => void; 
  onCancel: () => void;
  isSubmitting: boolean;
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="create-priority">Priority</Label>
          <Select 
            value={announcement.priority} 
            onValueChange={(value) => setAnnouncement({ ...announcement, priority: value as "low" | "normal" | "high" | "urgent" })}
            disabled={isSubmitting}
          >
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
          <Select 
            value={announcement.target_audience} 
            onValueChange={(value) => setAnnouncement({ ...announcement, target_audience: value as "all" | "500 level" | "400 level" | "300 level" })}
            disabled={isSubmitting}
          >
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
            value={announcement.expiry_date}
            onChange={(e) => setAnnouncement({ ...announcement, expiry_date: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={announcement.is_pinned}
              onChange={(e) => setAnnouncement({ ...announcement, is_pinned: e.target.checked })}
              className="rounded"
              disabled={isSubmitting}
            />
            Pin to Top
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Announcement'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Edit Form Component
const EditAnnouncementForm = ({ 
  announcement, 
  onUpdate, 
  onCancel,
  isSubmitting
}: { 
  announcement: Announcement | null; 
  onUpdate: (data: Partial<Announcement>) => void; 
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
    priority: announcement?.priority || "normal",
    target_audience: announcement?.target_audience || "all",
    expiry_date: announcement?.expiry_date ? announcement.expiry_date.split('T')[0] + 'T' + announcement.expiry_date.split('T')[1].substring(0, 5) : "",
    is_pinned: announcement?.is_pinned || false
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "normal" | "high" | "urgent" })}
            disabled={isSubmitting}
          >
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
          <Select 
            value={formData.target_audience} 
            onValueChange={(value) => setFormData({ ...formData, target_audience: value as "all" | "500 level" | "400 level" | "300 level" })}
            disabled={isSubmitting}
          >
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
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_pinned}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="rounded"
              disabled={isSubmitting}
            />
            Pin to Top
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Announcement'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AdminAnnouncements; 