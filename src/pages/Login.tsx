import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Shield } from "lucide-react";
import { useSupabaseAuth } from "@/lib";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useSupabaseAuth();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error.message || "Login failed");
      return;
    }
    // Optionally check for email confirmation here
    navigate("/admin");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">E-Access</h1>
          <p className="text-primary-foreground/80">Computer Engineering Education</p>
        </div>

        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Admin Sign In</CardTitle>
            <CardDescription>
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button 
                variant="gradient" 
                className="w-full" 
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In as Admin"}
              </Button>
              <div className="text-center mt-4">
                <Button variant="link" onClick={handleRegister} className="text-blue-600">
                  Register as Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;