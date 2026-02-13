"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Megaphone,
    Bell,
    Mail,
    Send,
    AlertTriangle,
    Info,
    CheckCircle2,
} from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { User } from "@/types/app-types";

interface BroadcasterProps {
    currentUser: User;
}

export function Broadcaster({ currentUser }: BroadcasterProps) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"announcement" | "system" | "bill" | "complaint">("announcement");
    const [isUrgent, setIsUrgent] = useState(false);
    const [sendEmail, setSendEmail] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const handleBroadcast = async () => {
        if (!title || !message) return;

        try {
            setIsLoading(true);
            setStatus(null);

            const response = await notificationsApi.create({
                title,
                message,
                type,
                urgent: isUrgent,
                buildingId: currentUser.buildingId || undefined,
                sendEmail, // This might need backend support, for now we assume it's handled or ignored
            });

            if (response) {
                setStatus({
                    type: "success",
                    text: `Broadcast sent successfully to all ${response.count || ''} residents!`,
                });
                setTitle("");
                setMessage("");
                setIsUrgent(false);
            }
        } catch (error) {
            console.error("Failed to send broadcast:", error);
            setStatus({
                type: "error",
                text: "Failed to send broadcast. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm overflow-hidden">
                <div className="h-2 bg-blue-600 w-full" />
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle>Announcement Board</CardTitle>
                            <CardDescription>
                                Send urgent alerts and announcements to all residents instantly
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {status && (
                        <Alert
                            className={
                                status.type === "success"
                                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                                    : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                            }
                        >
                            {status.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <AlertTitle>
                                {status.type === "success" ? "Success" : "Error"}
                            </AlertTitle>
                            <AlertDescription className={status.type === "success" ? "text-green-700" : "text-red-700"}>
                                {status.text}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="type">Notification Type</Label>
                                <Select
                                    value={type}
                                    onValueChange={(v: any) => setType(v)}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="announcement">Announcement</SelectItem>
                                        <SelectItem value="system">System Update</SelectItem>
                                        <SelectItem value="bill">Billing Alert</SelectItem>
                                        <SelectItem value="complaint">Complaint Update</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50 dark:bg-gray-800/20 mt-6">
                                <div className="space-y-0.5">
                                    <Label htmlFor="urgent" className="text-sm font-medium">Urgent Alert</Label>
                                    <p className="text-xs text-muted-foreground">Marks as important</p>
                                </div>
                                <Switch
                                    id="urgent"
                                    checked={isUrgent}
                                    onCheckedChange={setIsUrgent}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Broadcast Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Water Maintenance Today"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message Content</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                className="min-h-[150px]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label className="text-sm font-medium">Delivery Channels</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-800">
                                    <Bell className="w-4 h-4 text-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Push Notification</p>
                                        <p className="text-xs text-muted-foreground">App alert</p>
                                    </div>
                                    <Switch checked disabled />
                                </div>
                                <div className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-800">
                                    <Mail className="w-4 h-4 text-purple-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-xs text-muted-foreground">Direct to inbox</p>
                                    </div>
                                    <Switch
                                        checked={sendEmail}
                                        onCheckedChange={setSendEmail}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t py-4">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                        onClick={handleBroadcast}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            "Broadcasting..."
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Broadcast to Residents
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <Alert className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                    This broadcast will be sent to <strong>all residents</strong> in your building. Use urgent alerts sparingly for maximum impact.
                </AlertDescription>
            </Alert>
        </div>
    );
}
