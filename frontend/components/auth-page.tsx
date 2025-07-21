"use client";

import type React from "react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  Shield,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Wallet,
} from "lucide-react";
import type { User as UserType, Building } from "@/types/app-types";

interface AuthPageProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: UserType }>;
  onRegister: (
    userData: Partial<UserType>
  ) => Promise<{ success: boolean; message: string }>;
  buildings: Building[];
}

export default function AuthPage({
  onLogin,
  onRegister,
  buildings,
}: AuthPageProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "resident" as "super-admin" | "admin" | "resident",
    buildingId: "",
    flatNumber: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await onLogin(loginData.email, loginData.password);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
    } else {
      setMessage({ type: "error", text: result.message });
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      setIsLoading(false);
      return;
    }

    if (registerData.role === "resident" && !registerData.flatNumber) {
      setMessage({
        type: "error",
        text: "Flat number is required for residents",
      });
      setIsLoading(false);
      return;
    }

    if (
      (registerData.role === "admin" || registerData.role === "resident") &&
      !registerData.buildingId
    ) {
      setMessage({ type: "error", text: "Building selection is required" });
      setIsLoading(false);
      return;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await onRegister(registerData);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      // Reset form on success
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "resident",
        buildingId: "",
        flatNumber: "",
      });
    } else {
      setMessage({ type: "error", text: result.message });
    }

    setIsLoading(false);
  };

  const demoCredentials = [
    {
      role: "Super Admin",
      email: "superadmin@flatmanager.com",
      password: "superadmin123",
    },
    {
      role: "Building Admin",
      email: "admin@flatmanager.com",
      password: "admin123",
    },
    {
      role: "Resident",
      email: "resident@flatmanager.com",
      password: "resident123",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDark
          ? "dark bg-slate-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-white"
      }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-full px-3 py-2 md:px-4 md:py-2 shadow-lg border border-blue-200/50 dark:border-slate-700/50">
          <Sun className="h-4 w-4 text-amber-500" />
          <Switch
            checked={isDark}
            onCheckedChange={setIsDark}
            className="data-[state=checked]:bg-slate-600"
          />
          <Moon className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600"></div>
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

          {/* Floating Elements */}
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-6 md:p-8 lg:p-12">
            <div className="text-center mb-8 md:mb-10 lg:mb-12">
              {/* Enhanced Logo Container */}
              <div className="relative mb-6 md:mb-8">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300">
                  <Wallet className="h-10 w-10 md:h-12 md:w-12 text-white drop-shadow-lg" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-2xl md:rounded-3xl blur-xl animate-pulse"></div>
              </div>

              {/* Enhanced Typography */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                Flat Manager Pro
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-sm md:max-w-lg text-center leading-relaxed font-light tracking-wide px-4 md:px-0">
                Simplify flat management with intelligent expense tracking and
                seamless bill splitting
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-6 md:mt-8 px-4 md:px-0">
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-white/20">
                  📊 Smart Analytics
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-white/20">
                  💰 Bill Splitting
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-white/20">
                  🏠 Multi-Property
                </div>
              </div>
            </div>

            {/* Enhanced Floating Cards with better positioning and animations */}
            <div className="absolute top-16 right-16 w-36 h-24 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 animate-pulse">
              <div className="p-4 h-full flex flex-col justify-center">
                <div className="text-xs text-white/60 mb-1">
                  Monthly Savings
                </div>
                <div className="text-lg font-bold text-white">£1,247</div>
              </div>
            </div>

            <div className="absolute bottom-24 left-12 w-28 h-28 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-full shadow-2xl border border-white/10 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-xs text-white/60">Flatmates</div>
              </div>
            </div>

            <div className="absolute top-1/3 right-28 w-20 h-20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-white">12</div>
                <div className="text-xs text-white/60">Bills</div>
              </div>
            </div>

            <div className="absolute bottom-1/3 right-8 w-16 h-16 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-lg shadow-2xl border border-white/10 animate-pulse"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-sm md:max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 md:mb-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-slate-700 dark:to-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                <Wallet className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                Flat Manager Pro
              </h1>
            </div>

            {/* Form Container */}
            <div className="bg-white/95 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl md:shadow-2xl border border-blue-100/50 dark:border-slate-700/50">
              {/* Form Header */}
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
                  {isLogin ? "Welcome back" : "Get started"}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                  {isLogin ? "Sign in to your account" : "Create your account"}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl md:rounded-2xl p-1 mb-6 md:mb-8">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setActiveTab("login");
                  }}
                  className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                    isLogin
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setActiveTab("register");
                  }}
                  className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-medium transition-all duration-300 text-sm md:text-base ${
                    !isLogin
                      ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Login Form */}
              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 pr-11 md:pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me / Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {message && (
                    <Alert
                      className={
                        message.type === "error"
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
                          : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                      }
                    >
                      <AlertDescription
                        className={
                          message.type === "error"
                            ? "text-red-700 dark:text-red-400"
                            : "text-green-700 dark:text-green-400"
                        }
                      >
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-5 md:my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white/95 dark:bg-slate-900/70 px-4 text-slate-500 dark:text-slate-400">
                        or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 md:h-12 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-lg md:rounded-xl transition-all duration-300 shadow-sm hover:shadow-md dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-slate-300 text-sm md:text-base"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 md:h-12 bg-black hover:bg-gray-900 border-black text-white rounded-lg md:rounded-xl transition-all duration-300 shadow-sm hover:shadow-md dark:bg-black dark:hover:bg-gray-800 dark:border-gray-800 text-sm md:text-base"
                    >
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 mr-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      Apple
                    </Button>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form
                  onSubmit={handleRegister}
                  className="space-y-5 md:space-y-6"
                >
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 pr-11 md:pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {/* Role Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                    >
                      Role
                    </Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(
                        value: "super-admin" | "admin" | "resident"
                      ) =>
                        setRegisterData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Building Admin</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Building Field */}
                  {(registerData.role === "admin" ||
                    registerData.role === "resident") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="building"
                        className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                      >
                        Building
                      </Label>
                      <Select
                        value={registerData.buildingId}
                        onValueChange={(value) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            buildingId: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl">
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={building.id}>
                              {building.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Flat Number Field */}
                  {registerData.role === "resident" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="flatNumber"
                        className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base"
                      >
                        Flat Number
                      </Label>
                      <Input
                        id="flatNumber"
                        placeholder="e.g., 301, A-102"
                        value={registerData.flatNumber}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            flatNumber: e.target.value,
                          }))
                        }
                        className="h-11 md:h-12 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        required
                      />
                    </div>
                  )}

                  {message && (
                    <Alert
                      className={
                        message.type === "error"
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
                          : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                      }
                    >
                      <AlertDescription
                        className={
                          message.type === "error"
                            ? "text-red-700 dark:text-red-400"
                            : "text-green-700 dark:text-green-400"
                        }
                      >
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 md:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm md:text-base"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="text-center mt-4 md:mt-6">
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                By continuing, you agree to our{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Privacy Policy
                </button>
              </p>

              {/* Demo Credentials */}
              <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl md:rounded-2xl border border-blue-200/50 dark:border-slate-700/50">
                <h3 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 md:mb-3">
                  Demo Credentials
                </h3>
                <div className="space-y-1.5 md:space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300 sm:min-w-[100px]">
                      Super Admin:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs break-all">
                      superadmin@flatmanager.com / superadmin123
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300 sm:min-w-[100px]">
                      Admin:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs break-all">
                      admin@flatmanager.com / admin123
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-medium text-slate-700 dark:text-slate-300 sm:min-w-[100px]">
                      Resident:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs break-all">
                      resident@flatmanager.com / resident123
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
