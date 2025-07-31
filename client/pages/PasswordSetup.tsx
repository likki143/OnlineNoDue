import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/lib/auth";
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const PasswordSetup: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChar,
      isValid:
        minLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumbers &&
        hasSpecialChar,
    };
  };

  const passwordCriteria = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordCriteria.isValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await changePassword(newPassword);

      // Force page reload to refresh user profile and trigger proper redirect
      // This ensures the passwordSetupRequired flag is properly updated in the UI
      window.location.href =
        userProfile?.role === "department_officer"
          ? "/department/dashboard"
          : userProfile?.role === "admin"
            ? "/admin/dashboard"
            : "/";
    } catch (err: any) {
      setError(err.message || "Failed to update password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Password</CardTitle>
          <CardDescription>
            Welcome, {userProfile?.fullName}! Please create a new secure
            password to complete your account setup.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Password Requirements:
              </Label>
              <div className="space-y-1 text-sm">
                <div
                  className={`flex items-center space-x-2 ${passwordCriteria.minLength ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${passwordCriteria.minLength ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${passwordCriteria.hasUppercase ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${passwordCriteria.hasUppercase ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>One uppercase letter</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${passwordCriteria.hasLowercase ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${passwordCriteria.hasLowercase ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>One lowercase letter</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${passwordCriteria.hasNumbers ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${passwordCriteria.hasNumbers ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>One number</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${passwordCriteria.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`h-3 w-3 ${passwordCriteria.hasSpecialChar ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>One special character</span>
                </div>
                {confirmPassword && (
                  <div
                    className={`flex items-center space-x-2 ${passwordsMatch ? "text-green-600" : "text-red-600"}`}
                  >
                    <CheckCircle
                      className={`h-3 w-3 ${passwordsMatch ? "text-green-600" : "text-red-400"}`}
                    />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !passwordCriteria.isValid || !passwordsMatch}
            >
              {loading ? "Setting up..." : "Set Password & Continue"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> This is a one-time password
                setup. Your new password will replace the temporary password
                sent to your email.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordSetup;
