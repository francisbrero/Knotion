import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient, getCommentChannelName } from "~/lib/pusher";
import { api } from "~/trpc/react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

type Comment = {
  id: string;
  text: string;
  authorId: string;
  linkId: string;
  createdAt: Date;
  parentId: string | null;
  rangeStart: number;
  rangeEnd: number;
  rangeSelector: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
};

interface CommentSidebarProps {
  linkId: string;
  onClose: () => void;
}

export function CommentSidebar({ linkId, onClose }: CommentSidebarProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  
  // Fetch comments
  const { data, isLoading } = api.comment.getByLinkId.useQuery(
    { linkId },
    { enabled: Boolean(session?.user) && Boolean(linkId) }
  );
  
  // Set comments when data is loaded
  useEffect(() => {
    if (data) {
      setComments(data);
    }
  }, [data]);
  
  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!linkId || !session?.user) return;
    
    const channel = pusherClient.subscribe(getCommentChannelName(linkId));
    
    channel.bind('new-comment', (data: { comment: Comment }) => {
      setComments((prevComments) => {
        // If it's a reply, find the parent and add it to replies
        if (data.comment.parentId) {
          return prevComments.map(comment => {
            if (comment.id === data.comment.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data.comment]
              };
            }
            return comment;
          });
        }
        // Otherwise add it as a top-level comment
        return [...prevComments, data.comment];
      });
    });
    
    return () => {
      pusherClient.unsubscribe(getCommentChannelName(linkId));
    };
  }, [linkId, session?.user]);
  
  // Create comment mutation
  const createCommentMutation = api.comment.create.useMutation({
    onSuccess: () => {
      setNewCommentText("");
      setReplyTo(null);
    },
  });
  
  const handleSubmitComment = (parentId: string | null = null) => {
    if (!newCommentText.trim() || !session?.user) return;
    
    createCommentMutation.mutate({
      linkId,
      text: newCommentText,
      rangeStart: 0, // These would normally come from a selection
      rangeEnd: 0,
      rangeSelector: "",
      ...(parentId && { parentId }),
    });
  };
  
  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
  };
  
  const renderComment = (comment: Comment) => (
    <Card key={comment.id} className="mb-4">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || "User"} />
          <AvatarFallback>
            {comment.author.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{comment.author.name || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{comment.text}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleReply(comment.id)}
        >
          Reply
        </Button>
      </CardFooter>
      
      {/* Show replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 pl-4 border-l">
          {comment.replies.map(renderComment)}
        </div>
      )}
      
      {/* Reply form */}
      {replyTo === comment.id && (
        <div className="p-4 pt-0">
          <Textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a reply..."
            className="mb-2"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleSubmitComment(comment.id)}
              disabled={createCommentMutation.isLoading}
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
  
  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-card p-4 shadow-lg overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      {isLoading ? (
        <p className="text-muted-foreground text-center py-4">Loading comments...</p>
      ) : (
        <>
          {/* New top-level comment form */}
          <div className="mb-6">
            <Textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2"
            />
            <Button 
              onClick={() => handleSubmitComment()}
              disabled={createCommentMutation.isLoading}
              className="w-full"
            >
              Comment
            </Button>
          </div>
          
          {/* Comment list */}
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No comments yet</p>
          ) : (
            <div>
              {comments.filter(c => !c.parentId).map(renderComment)}
            </div>
          )}
        </>
      )}
    </div>
  );
} 