"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Wallet,
  Shield,
  Mail,
  Lock,
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 ${isDark ? "dark bg-slate-950 text-white" : "bg-white text-slate-900"
        }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <div className="flex items-center space-x-2 bg-background/50 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1.5 border border-border transition-all hover:bg-background/80">
          <Sun className="h-4 w-4 text-amber-500" />
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            className="data-[state=checked]:bg-blue-600 scale-75 md:scale-90"
          />
          <Moon className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Left Panel - Dark Navy Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-center items-center p-12 overflow-hidden text-white">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] opacity-40 animate-pulse duration-4s"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-30 animate-pulse duration-6s"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
          {/* Top Floating Cards Row */}
          <div className="flex items-center gap-6 mb-12">
            {/* Wallet Card */}
            <div className="w-20 h-20 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Wallet className="h-8 w-8 text-white" />
            </div>

            {/* Monthly Card */}
            <div className="w-24 h-24 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center justify-center shadow-2xl relative -mt-4 transform hover:scale-105 transition-transform duration-300">
              <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1 font-medium">
                Monthly
              </div>
              <div className="text-xl font-bold text-white">£1,247</div>
            </div>

            {/* Home Card */}
            <div className="w-20 h-20 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Main Typography */}
          <h1 className="text-5xl font-bold mb-6 text-white text-center tracking-tight">
            Flat Manager Pro
          </h1>
          <p className="text-lg text-slate-400 text-center max-w-md leading-relaxed font-light mb-10">
            Simplify flat management with intelligent expense tracking and
            seamless bill splitting.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-slate-300">
                Smart Analytics
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium text-slate-300">
                Bill Splitting
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-slate-300">
                Multi-Property
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Left Floating Card */}
        <div className="absolute bottom-12 left-12">
          <div className="w-32 h-24 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex flex-col justify-end p-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <div className="text-3xl font-bold text-white leading-none mb-1">
              4
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
              Flatmates
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="w-full max-w-[420px]">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/20">
              <Wallet className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Flat Manager Pro
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? "Sign in to your account"
                : "Enter your details to get started"}
            </p>
          </div>

          {/* Tabs Segmented Control */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-8 flex transition-colors duration-300">
            <button
              onClick={() => {
                setIsLogin(true);
                setActiveTab("login");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isLogin
                ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setActiveTab("register");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${!isLogin
                ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground/80"
                }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground/80 font-medium"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-none focus-visible:ring-blue-500 transition-all text-slate-900 dark:text-white"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-foreground/80 font-medium"
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-none focus-visible:ring-blue-500 transition-all text-slate-900 dark:text-white"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 transition-colors"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-foreground/70 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                  className={`border ${message.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20"
                    : "bg-green-50 dark:bg-green-900/20"
                    }`}
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-md shadow-lg shadow-blue-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-name"
                    className="text-foreground/80 font-medium"
                  >
                    Name
                  </Label>
                  <Input
                    id="reg-name"
                    placeholder="Full name"
                    className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-role"
                    className="text-foreground/80 font-medium"
                  >
                    Role
                  </Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(val: any) =>
                      setRegisterData({ ...registerData, role: val })
                    }
                  >
                    <SelectTrigger
                      id="reg-role"
                      className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">Resident</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-email"
                  className="text-foreground/80 font-medium"
                >
                  Email
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="reg-pass"
                  className="text-foreground/80 font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                  </span>
                  <Input
                    id="reg-pass"
                    type="password"
                    placeholder="Create password"
                    className="pl-9 h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-phone"
                    className="text-foreground/80 font-medium"
                  >
                    Phone
                  </Label>
                  <Input
                    id="reg-phone"
                    placeholder="Phone"
                    className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                {(registerData.role === "resident" ||
                  registerData.role === "admin") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="reg-building"
                        className="text-foreground/80 font-medium"
                      >
                        Building
                      </Label>
                      <Select
                        value={registerData.buildingId}
                        onValueChange={(val) =>
                          setRegisterData({ ...registerData, buildingId: val })
                        }
                      >
                        <SelectTrigger
                          id="reg-building"
                          className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </div>

              {registerData.role === "resident" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="reg-flat"
                    className="text-foreground/80 font-medium"
                  >
                    Flat Number
                  </Label>
                  <Input
                    id="reg-flat"
                    placeholder="e.g. 101"
                    className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    value={registerData.flatNumber}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        flatNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-2 shadow-lg shadow-blue-600/20"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-input bg-background hover:bg-muted/50 font-medium text-foreground transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              className="h-12 rounded-xl border-input bg-background hover:bg-muted/50 font-medium text-foreground transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="text-center mb-8">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-600 hover:underline cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-4 text-center">
              Demo Credentials
            </h3>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center group">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Super Admin:
                </span>
                <span className="group-hover:text-blue-600 transition-colors">
                  superadmin@demo.com / Demo123!
                </span>
              </div>
              <div className="block h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center group">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Admin:
                </span>
                <span className="group-hover:text-blue-600 transition-colors">
                  admin1@demo.com / Demo123!
                </span>
              </div>
              <div className="block h-px w-full bg-slate-200 dark:bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center group">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Resident:
                </span>
                <span className="group-hover:text-blue-600 transition-colors">
                  resident1@demo.com / Demo123!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
