import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Shield,
  Upload,
  Megaphone,
  Eye,
  Save,
  AlertTriangle,
  Users,
  FileText,
  Mail,
  Bell,
  Database,
  Globe,
  Lock,
  Key
} from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "EduTech Platform",
    siteDescription: "Computer Engineering Educational Platform",
    contactEmail: "admin@edutech.com",
    maxFileSize: "300",
    allowedFileTypes: "pdf,doc,docx,ppt,pptx,mp4,avi,mov",
    autoEnrollment: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: "8",
    requireTwoFactor: false,
    sessionTimeout: "30",
    loginAttempts: "5",
    ipWhitelist: "",
    sslRequired: true,
    dataEncryption: true
  });

  // Upload Guidelines State
  const [uploadGuidelines, setUploadGuidelines] = useState({
    generalGuidelines: "Please ensure all files are properly formatted and contain educational content relevant to computer engineering.",
    fileNaming: "Use descriptive file names with course codes (e.g., CSE201_Lecture1.pdf)",
    qualityStandards: "All documents must be clear, legible, and in good quality. Videos should be at least 720p resolution.",
    copyrightNotice: "Ensure all uploaded content is original or properly licensed for educational use."
  });

  // Announcement State
  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    priority: "normal",
    targetAudience: "all",
    expiryDate: ""
  });

  // Toggle Sections State
  const [toggleSections, setToggleSections] = useState({
    studentRegistration: true,
    courseEnrollment: true,
    downloadSection: true,
    forumSection: true,
    announcementSection: true,
    feedbackSection: true,
    resourceSharing: true,
    mobileApp: false
  });

  const handleSaveGeneral = () => {
    toast({
      title: "Success",
      description: "General settings saved successfully"
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Success",
      description: "Security settings updated successfully"
    });
  };

  const handleSaveGuidelines = () => {
    toast({
      title: "Success",
      description: "Upload guidelines updated successfully"
    });
  };

  const handleSendAnnouncement = () => {
    if (!announcement.title || !announcement.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Announcement sent to ${announcement.targetAudience}`
    });

    setAnnouncement({
      title: "",
      message: "",
      priority: "normal",
      targetAudience: "all",
      expiryDate: ""
    });
  };

  const handleToggleSection = (section: string, enabled: boolean) => {
    setToggleSections(prev => ({
      ...prev,
      [section]: enabled
    }));
    
    toast({
      title: "Success",
      description: `${section} has been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings, security, and manage system features
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Sections
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={generalSettings.maxFileSize}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={generalSettings.allowedFileTypes}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                    placeholder="pdf,doc,docx,ppt,pptx,mp4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto Enrollment</Label>
                    <p className="text-sm text-muted-foreground">Automatically enroll students in core courses</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoEnrollment}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, autoEnrollment: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                  </div>
                  <Switch
                    checked={generalSettings.emailNotifications}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the platform in maintenance mode</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGeneral} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist (optional)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Enter IP addresses or ranges, one per line</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Mandatory 2FA for all admin accounts</p>
                  </div>
                  <Switch
                    checked={securitySettings.requireTwoFactor}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SSL Required</Label>
                    <p className="text-sm text-muted-foreground">Force HTTPS connections</p>
                  </div>
                  <Switch
                    checked={securitySettings.sslRequired}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, sslRequired: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive data at rest</p>
                  </div>
                  <Switch
                    checked={securitySettings.dataEncryption}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, dataEncryption: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Guidelines */}
        <TabsContent value="upload">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Guidelines
              </CardTitle>
              <CardDescription>
                Configure guidelines and rules for file uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="generalGuidelines">General Guidelines</Label>
                  <Textarea
                    id="generalGuidelines"
                    value={uploadGuidelines.generalGuidelines}
                    onChange={(e) => setUploadGuidelines(prev => ({ ...prev, generalGuidelines: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileNaming">File Naming Convention</Label>
                  <Textarea
                    id="fileNaming"
                    value={uploadGuidelines.fileNaming}
                    onChange={(e) => setUploadGuidelines(prev => ({ ...prev, fileNaming: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualityStandards">Quality Standards</Label>
                  <Textarea
                    id="qualityStandards"
                    value={uploadGuidelines.qualityStandards}
                    onChange={(e) => setUploadGuidelines(prev => ({ ...prev, qualityStandards: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="copyrightNotice">Copyright Notice</Label>
                  <Textarea
                    id="copyrightNotice"
                    value={uploadGuidelines.copyrightNotice}
                    onChange={(e) => setUploadGuidelines(prev => ({ ...prev, copyrightNotice: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGuidelines} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Upload Guidelines
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Send Announcement
              </CardTitle>
              <CardDescription>
                Send announcements to students, instructors, or all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="announcementTitle">Title *</Label>
                  <Input
                    id="announcementTitle"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Important System Update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={announcement.priority} onValueChange={(value) => setAnnouncement(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={announcement.targetAudience} onValueChange={(value) => setAnnouncement(prev => ({ ...prev, targetAudience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="instructors">Instructors Only</SelectItem>
                      <SelectItem value="admins">Administrators Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={announcement.expiryDate}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcementMessage">Message *</Label>
                <Textarea
                  id="announcementMessage"
                  value={announcement.message}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your announcement message here..."
                  rows={5}
                />
              </div>

              <Button onClick={handleSendAnnouncement} className="w-full">
                <Megaphone className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Toggle Sections */}
        <TabsContent value="sections">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Platform Sections
              </CardTitle>
              <CardDescription>
                Enable or disable various platform features and sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(toggleSections).map(([section, enabled]) => (
                  <div key={section} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base capitalize">
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {section === 'studentRegistration' && 'Allow new student registrations'}
                        {section === 'courseEnrollment' && 'Enable course enrollment system'}
                        {section === 'downloadSection' && 'Allow file downloads'}
                        {section === 'forumSection' && 'Enable discussion forums'}
                        {section === 'announcementSection' && 'Show announcements to users'}
                        {section === 'feedbackSection' && 'Enable feedback and rating system'}
                        {section === 'resourceSharing' && 'Allow resource sharing between users'}
                        {section === 'mobileApp' && 'Enable mobile app access'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleToggleSection(section, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;