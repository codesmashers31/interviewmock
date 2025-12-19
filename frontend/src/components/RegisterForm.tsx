// src/components/RegisterForm.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";

interface FormData {
  email: string;
  userType: string;
  otp: string;
  name: string;
  password: string;
  confirmPassword: string;
}

const userTypeOptions = [
  { value: "candidate", label: "Candidate" },
  { value: "expert", label: "Expert" }
];

export const RegisterForm = () => {
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    userType: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.userType) {
      setError("Please select whether you're a Candidate or Expert");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      await sendOtp();
      setIsLoading(false);
      setStep("otp");
      startCountdown();
    } catch (err) {
      setIsLoading(false);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp
      });
      setIsLoading(false);
      setStep("details");
    } catch (err: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid verification code");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid verification code");
      }
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await register(
        formData.email,
        formData.password,
        formData.userType,
        formData.name.trim()
      );
      setIsLoading(false);
      // after register we go to dashboard if expert, or to landing - your register currently navigates to /dashboard
      // If you want role-based redirect here too, adjust based on formData.userType
      if (formData.userType === "expert") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  const sendOtp = async () => {
    try {
      const response = await axios.post("/api/auth/send-otp", {
        email: formData.email,
        userType: formData.userType
      });
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || "Failed to send OTP");
      }
      if (err instanceof Error) {
        throw err;
      }
      throw new Error("Failed to send OTP");
    }
  };

  const startCountdown = () => {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError("");
    try {
      await sendOtp();
      setIsLoading(false);
      startCountdown();
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setError(err.message || "Failed to resend OTP");
      } else {
        setError("Failed to resend OTP");
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-sm text-slate-600">
            Already Registered?{" "}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
        <Card className="w-full shadow-lg border-none bg-white">
          <CardHeader className="text-center space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">
              {step === "email" ? "Create your account" : step === "otp" ? "Verify your email" : "Complete your profile"}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              {step === "email"
                ? "Join thousands of professionals"
                : step === "otp"
                ? `Enter verification code sent to ${formData.email}`
                : "Add your personal details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-slate-200 text-red-700 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    className="w-full h-10"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    We'll send a verification code to this email
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userType" className="text-sm font-medium text-slate-700">
                    I am a
                  </Label>
                  <Select
                    id="userType"
                    options={userTypeOptions}
                    value={userTypeOptions.find(o => o.value === formData.userType)}
                    onChange={option => handleInputChange("userType", option?.value ?? "")}
                    placeholder="Select or type your role"
                    isSearchable
                    classNamePrefix="react-select"
                    styles={{
                      control: base => ({
                        ...base,
                        minHeight: "2.5rem",
                        borderColor: "#CBD5E1", // Tailwind slate-200 matches this hex well
                        boxShadow: "none",
                        fontSize: "1rem",
                      }),
                      menu: base => ({
                        ...base,
                        fontSize: "1rem",
                        zIndex: 10,
                      }),
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </form>
            ) : step === "otp" ? (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-slate-700">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={e => handleInputChange("otp", e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-10 text-center text-lg tracking-widest"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                      Didn't receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-xs text-gray-600 hover:text-gray-700 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded"
                  disabled={isLoading || formData.otp.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                    }}
                    className="text-sm text-slate-600 hover:text-slate-800"
                  >
                    ← Change email address
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e => handleInputChange("name", e.target.value)}
                    className="w-full h-10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={e => handleInputChange("password", e.target.value)}
                    className="w-full h-10"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full h-10"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
            <Separator />
            <div className="text-center space-y-3">
              <Button
                variant="outline"
                className="w-full h-10 rounded border-slate-300"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
