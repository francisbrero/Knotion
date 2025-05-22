"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";

type Tag = {
  id: string;
  name: string;
  _count: {
    links: number;
  };
};

export default function TagsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch tags
  const tagsQuery = api.tags.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  
  const tags = tagsQuery.data;
  const refetch = tagsQuery.refetch;

  // Create tag mutation
  const createTag = api.tags.create.useMutation({
    onSuccess: () => {
      setTagName("");
      setIsOpen(false);
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update tag mutation
  const updateTag = api.tags.update.useMutation({
    onSuccess: () => {
      setTagName("");
      setEditingTag(null);
      setIsOpen(false);
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Delete tag mutation
  const deleteTag = api.tags.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Handle dialog close
  const handleDialogClose = () => {
    setIsOpen(false);
    setTagName("");
    setEditingTag(null);
    setError(null);
  };

  // Handle edit tag
  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setIsOpen(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tagName.trim()) {
      setError("Tag name is required");
      return;
    }

    try {
      if (editingTag) {
        await updateTag.mutateAsync({
          id: editingTag.id,
          name: tagName.trim(),
        });
      } else {
        await createTag.mutateAsync({
          name: tagName.trim(),
        });
      }
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  // Handle delete tag
  const handleDeleteTag = async (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      await deleteTag.mutateAsync({ id });
    }
  };

  // Open dialog for new tag
  const openNewTagDialog = () => {
    setEditingTag(null);
    setTagName("");
    setIsOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tags</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={openNewTagDialog}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Tag
            </button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter tag name"
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <DialogFooter>
                <button
                  type="button"
                  onClick={handleDialogClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTag ? "Save Changes" : "Create Tag"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {tagsQuery.isLoading ? (
        <div className="text-center py-8">Loading tags...</div>
      ) : !tags || tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tags found. Create your first tag by clicking the "Add Tag" button.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag Name</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <Badge variant="blue" className="font-normal">
                    {tag.name}
                  </Badge>
                </TableCell>
                <TableCell>{tag._count.links}</TableCell>
                <TableCell className="text-right space-x-2">
                  <button
                    onClick={() => handleEditTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={tag._count.links > 0}
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
} 