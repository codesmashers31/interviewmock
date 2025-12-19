// src/components/LoginForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Separator } from "./ui/separator";
import { useAuth } from "../context/AuthContext";

export const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user: ctxUser } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // login returns the user object (AuthContext.login should return User)
      const returnedUser = await login(formData.email, formData.password);
      const finalUser = returnedUser ?? ctxUser;

      if (!finalUser) {
        setError("Login succeeded but user data is unavailable.");
        return;
      }

      if (finalUser.userType === "expert") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            New here?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <Card className="w-full shadow-lg border-none bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-500 text-sm mt-1">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-11 border border-gray-200 rounded-lg px-3 text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-11 border border-gray-200 rounded-lg px-3 text-gray-800 bg-gray-50 focus:outline-none focus:border-gray-300"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="flex items-center my-6">
              <span className="flex-1 border-t border-gray-200"></span>
              <span className="mx-3 text-gray-400 text-xs">OR</span>
              <span className="flex-1 border-t border-gray-200"></span>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                className="w-full h-11 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                type="button"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <Separator />

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
