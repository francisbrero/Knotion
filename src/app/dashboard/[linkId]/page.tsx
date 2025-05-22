"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/react";
import { CommentSidebar } from "~/components/ui/CommentSidebar";
import { Button } from "~/components/ui/button";

export default function LinkDetailPage() {
  const params = useParams<{ linkId: string }>();
  const linkId = params.linkId;
  const [showComments, setShowComments] = useState(false);
  
  // Fetch link data
  const { data: link, isLoading } = api.links.getById.useQuery(
    { id: linkId },
    { enabled: Boolean(linkId) }
  );
  
  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (!link) {
    return <div className="p-8">Link not found or you don't have access</div>;
  }
  
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{link.title}</h1>
        <div className="mb-6">
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {link.url}
          </a>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-700">{link.description}</p>
        </div>
        
        <Button
          onClick={() => setShowComments(prev => !prev)}
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </Button>
      </div>
      
      {showComments && (
        <CommentSidebar
          linkId={linkId}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
} 