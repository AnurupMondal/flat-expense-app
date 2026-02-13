"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    MessageSquare,
    Plus,
    Trash2,
    Image as ImageIcon,
    Tag,
    AlertCircle,
    Calendar,
    Package,
} from "lucide-react";
import { communityApi } from "@/lib/api";
import { User } from "@/types/app-types";

interface CommunityPost {
    id: string;
    user_id: string;
    building_id: string;
    title: string;
    content: string;
    category: string;
    attachments: string[];
    created_at: string;
    author_name: string;
    author_avatar?: string;
}

interface CommunityBoardProps {
    currentUser: User;
}

export function CommunityBoard({ currentUser }: CommunityBoardProps) {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        category: "General",
    });
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const fetchedPosts = await communityApi.getAll();
            setPosts(fetchedPosts || []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) return;

        try {
            setIsPosting(true);
            const post = await communityApi.create(newPost);
            if (post) {
                setPosts([post, ...posts]);
                setNewPost({ title: "", content: "", category: "General" });
            }
        } catch (error) {
            console.error("Failed to create post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await communityApi.delete(postId);
            setPosts(posts.filter((p) => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Lost & Found":
                return <Package className="w-4 h-4" />;
            case "Event":
                return <Calendar className="w-4 h-4" />;
            case "Urgent":
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Tag className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Lost & Found":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "Event":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "Urgent":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const filteredPosts =
        filter === "all" ? posts : posts.filter((p) => p.category === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="Event">Events</SelectItem>
                            <SelectItem value="Lost & Found">Lost & Found</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Community Post</DialogTitle>
                            <DialogDescription>
                                Share something with your neighbors.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Title
                                </label>
                                <Input
                                    placeholder="What's on your mind?"
                                    value={newPost.title}
                                    onChange={(e) =>
                                        setNewPost({ ...newPost, title: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Category
                                </label>
                                <Select
                                    value={newPost.category}
                                    onValueChange={(val) =>
                                        setNewPost({ ...newPost, category: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Event">Event</SelectItem>
                                        <SelectItem value="Lost & Found">Lost & Found</SelectItem>
                                        <SelectItem value="Urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Content
                                </label>
                                <Textarea
                                    placeholder="Add more details..."
                                    className="min-h-[120px]"
                                    value={newPost.content}
                                    onChange={(e) =>
                                        setNewPost({ ...newPost, content: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleCreatePost}
                                disabled={isPosting || !newPost.title || !newPost.content}
                            >
                                {isPosting ? "Posting..." : "Post Now"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-32 bg-gray-100 dark:bg-gray-800" />
                            <CardContent className="h-24 bg-gray-50 dark:bg-gray-900" />
                        </Card>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Be the first one to share something with the community!
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post) => (
                        <Card
                            key={post.id}
                            className="group overflow-hidden transition-all hover:shadow-md border-gray-200 dark:border-gray-800"
                        >
                            <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-800/50">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge
                                        className={`flex items-center gap-1.5 px-2 py-0.5 pointer-events-none ${getCategoryColor(
                                            post.category
                                        )}`}
                                    >
                                        {getCategoryIcon(post.category)}
                                        {post.category}
                                    </Badge>
                                    {(post.user_id === currentUser.id ||
                                        currentUser.role === "admin") && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                </div>
                                <CardTitle className="leading-tight text-xl">
                                    {post.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-3 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        {post.author_avatar ? (
                                            <AvatarImage src={post.author_avatar} />
                                        ) : (
                                            <AvatarFallback className="text-[10px]">
                                                {post.author_name.charAt(0)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <span className="font-medium">{post.author_name}</span>
                                </div>
                                <span>
                                    {formatDistanceToNow(new Date(post.created_at), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
