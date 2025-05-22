"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Bookmarklet } from "./bookmarklet";

type Link = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  createdAt: Date;
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
};

export default function LinksPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch links
  const linksQuery = api.links.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  // Use type assertion to fix linter error
  const links = linksQuery.data as Link[] | undefined;
  const refetch = linksQuery.refetch;

  // Create link mutation
  const createLink = api.links.create.useMutation({
    onSuccess: () => {
      setUrl("");
      setTags("");
      setIsSubmitting(false);
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
      setIsSubmitting(false);
    },
  });

  // Delete link mutation
  const deleteLink = api.links.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createLink.mutateAsync({
        url,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      });
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  // Handle link deletion
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink.mutateAsync({ id });
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Links</h1>

      {/* Add Link Form */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Save a New Link</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="url" className="mb-2 block font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="tags" className="mb-2 block font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="productivity, research, etc."
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting || !url}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Link"}
          </button>
        </form>
      </div>

      {/* Bookmarklet */}
      <Bookmarklet />

      {/* Links List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Saved Links</h2>

        {!links || links.length === 0 ? (
          <p className="text-gray-600">No links saved yet. Add your first link above!</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {links.map((link) => (
              <li key={link.id} className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.title ?? link.url}
                      </a>
                    </h3>
                    {link.description && (
                      <p className="mt-1 text-sm text-gray-600">{link.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {link.tags.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Saved on {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                      aria-label="Delete link"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
} 