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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, User, Shield, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-elevated hover-lift">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              FlatManager Pro
            </h1>
            <p className="text-muted-foreground font-medium">
              Smart Expense & Complaint Management
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <Card className="border-0 shadow-card bg-card/60 backdrop-blur-md hover-lift rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-primary font-semibold">
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div
                key={index}
                className="text-xs space-y-1 p-2 rounded-lg bg-muted/30"
              >
                <p className="font-semibold text-primary">{cred.role}:</p>
                <p className="text-muted-foreground">Email: {cred.email}</p>
                <p className="text-muted-foreground">
                  Password: {cred.password}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Auth Form */}
        <Card className="border-0 shadow-elevated bg-card/80 backdrop-blur-md hover-lift rounded-card">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="font-medium">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="font-medium">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Welcome Back
                </CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
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
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {message && (
                    <Alert
                      className={
                        message.type === "error"
                          ? "border-red-200 bg-red-50"
                          : "border-green-200 bg-green-50"
                      }
                    >
                      <AlertDescription
                        className={
                          message.type === "error"
                            ? "text-red-700"
                            : "text-green-700"
                        }
                      >
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Create Account
                </CardTitle>
                <CardDescription>Register for a new account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        value={registerData.phone}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create password"
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={registerData.role}
                      onValueChange={(
                        value: "super-admin" | "admin" | "resident"
                      ) =>
                        setRegisterData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Building Admin</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(registerData.role === "admin" ||
                    registerData.role === "resident") && (
                    <div className="space-y-2">
                      <Label htmlFor="building">Building</Label>
                      <Select
                        value={registerData.buildingId}
                        onValueChange={(value) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            buildingId: value,
                          }))
                        }
                      >
                        <SelectTrigger>
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

                  {registerData.role === "resident" && (
                    <div className="space-y-2">
                      <Label htmlFor="flatNumber">Flat Number</Label>
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
                        required
                      />
                    </div>
                  )}

                  {message && (
                    <Alert
                      className={
                        message.type === "error"
                          ? "border-destructive/30 bg-destructive/10"
                          : "border-success/30 bg-success/10"
                      }
                    >
                      <AlertDescription
                        className={
                          message.type === "error"
                            ? "text-destructive"
                            : "text-success"
                        }
                      >
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
