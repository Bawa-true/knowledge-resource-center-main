import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/lib";
import { useUserProfile } from "@/lib";

const roles = ["Lecturer", "Classrep", "Lab Technician", "Admin"];

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [staffPin, setStaffPin] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useSupabaseAuth();
  const { createProfile } = useUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    // Set display name and role in user_metadata
    const result = await signUp(email, password, {
      options: { data: { name, role, staff_pin: staffPin } }
    });
    if (result.error) {
      setLoading(false);
      setError(result.error.message || "Registration failed");
      return;
    }
    // Create profile row with all details
    if (result.data?.user) {
      await createProfile(result.data.user, { name, role, email, staff_pin: staffPin });
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/upload"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Admin Registration</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center text-green-600 font-semibold py-8">
                Registration successful! Redirecting to login...
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@university.edu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select id="role" value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-pin">Staff PIN (Optional)</Label>
                  <Input id="staff-pin" value={staffPin} onChange={e => setStaffPin(e.target.value)} placeholder="Enter staff PIN" />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 