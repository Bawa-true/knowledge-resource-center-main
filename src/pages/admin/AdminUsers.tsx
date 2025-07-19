import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProfile } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const USERS_PER_PAGE = 10;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  join_date: string;
  last_login?: string;
  is_logged_in: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  staff_pin?: string;
  role: string;
  email: string;
  created_at: string;
  updated_at: string;
}

const AdminUsers = () => {
  const { getAllUsers, updateProfile, getUserProfile, updateUserProfile, loading, error } = useUserProfile();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ name: string; email: string; role: string; full_name: string; staff_pin?: string } | null>(null);
  const [actionError, setActionError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: usersData } = await getAllUsers();
      if (usersData) {
        setUsers(usersData as User[]);
        
        // Fetch profiles for all users
        const profilesData = await Promise.all(
          usersData.map(async (user: User) => {
            const { data: profileData } = await getUserProfile(user.id);
            return profileData;
          })
        );
        
        setProfiles(profilesData.filter(Boolean) as Profile[]);
      }
    })();
  }, [getAllUsers, getUserProfile]);

  const handleEdit = (user: User) => {
    setEditUserId(user.id);
    const profile = profiles.find(p => p.user_id === user.id);
    setEditData({ 
      name: user.name, 
      email: user.email, 
      role: user.role,
      full_name: profile?.full_name || user.name,
      staff_pin: profile?.staff_pin || ''
    });
    setActionError("");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editData) return;
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (userId: string) => {
    if (!editData) return;
    
    // Update user data
    const { error: userError } = await updateProfile(userId, {
      name: editData.name,
      email: editData.email,
      role: editData.role
    });
    
    if (userError) {
      setActionError(userError.message);
      toast({ title: "Error", description: userError.message, variant: "destructive" });
      return;
    }
    
    // Update profile data
    const { error: profileError } = await updateUserProfile(userId, {
      full_name: editData.full_name,
      role: editData.role,
      email: editData.email,
      staff_pin: editData.staff_pin
    });
    
    if (profileError) {
      setActionError(profileError.message);
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return;
    }
    
    // Update local state
    setUsers(users.map(u => (u.id === userId ? { ...u, name: editData.name, email: editData.email, role: editData.role } : u)));
    setProfiles(profiles.map(p => (p.user_id === userId ? { ...p, full_name: editData.full_name, role: editData.role, email: editData.email, staff_pin: editData.staff_pin } : p)));
    
    setEditUserId(null);
    setEditData(null);
    setActionError("");
    toast({ title: "User updated", description: "User details updated successfully." });
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const { error } = await updateProfile(userToDelete, { status: "inactive" });
    if (error) {
      setActionError(error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      return;
    }
    setUsers(users.filter(u => u.id !== userToDelete));
    setActionError("");
    setShowDeleteDialog(false);
    setUserToDelete(null);
    toast({ title: "User deleted", description: "User has been set to inactive." });
  };

  const filteredUsers = users.filter(u => {
    const profile = profiles.find(p => p.user_id === u.id);
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      profile?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      profile?.staff_pin?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2 items-center">
            <Label htmlFor="search">Search:</Label>
            <Input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email" />
        </div>
          {loading && <div>Loading users...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {actionError && <div className="text-red-600">{actionError}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Full Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Staff PIN</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => {
                  const profile = profiles.find(p => p.user_id === user.id);
                  return (
                    <tr key={user.id} className="border-b">
                      <td className="p-2 border">
                        {editUserId === user.id ? (
                          <Input name="name" value={editData?.name || ""} onChange={handleEditChange} />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td className="p-2 border">
                        {editUserId === user.id ? (
                          <Input name="full_name" value={editData?.full_name || ""} onChange={handleEditChange} />
                        ) : (
                          profile?.full_name || user.name
                        )}
                      </td>
                      <td className="p-2 border">
                        {editUserId === user.id ? (
                          <Input name="email" value={editData?.email || ""} onChange={handleEditChange} />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td className="p-2 border">
                        {editUserId === user.id ? (
                          <select name="role" value={editData?.role || ""} onChange={handleEditChange} className="border rounded px-2 py-1">
                            <option value="Lecturer">Lecturer</option>
                            <option value="Classrep">Classrep</option>
                            <option value="Lab Technician">Lab Technician</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>
                      <td className="p-2 border">
                        {editUserId === user.id ? (
                          <Input name="staff_pin" value={editData?.staff_pin || ""} onChange={handleEditChange} />
                        ) : (
                          profile?.staff_pin || '-'
                        )}
                      </td>
                      <td className="p-2 border">{user.status}</td>
                    <td className="p-2 border flex gap-2">
                      {editUserId === user.id ? (
                        <>
                          <Button size="sm" onClick={() => handleEditSave(user.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditUserId(null); setEditData(null); }}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                            Edit
          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                            Delete
          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this user? This will set their status to inactive.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
                    </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
                    </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;