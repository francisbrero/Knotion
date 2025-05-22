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

type Collection = {
  id: string;
  name: string;
  visibility: string;
  _count: {
    links: number;
  };
};

export default function CollectionsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [error, setError] = useState<string | null>(null);

  // Fetch collections
  const collectionsQuery = api.collections.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  
  const collections = collectionsQuery.data;
  const refetch = collectionsQuery.refetch;

  // Create collection mutation
  const createCollection = api.collections.create.useMutation({
    onSuccess: () => {
      setCollectionName("");
      setVisibility("PRIVATE");
      setIsOpen(false);
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Update collection mutation
  const updateCollection = api.collections.update.useMutation({
    onSuccess: () => {
      setCollectionName("");
      setVisibility("PRIVATE");
      setEditingCollection(null);
      setIsOpen(false);
      void refetch();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Delete collection mutation
  const deleteCollection = api.collections.delete.useMutation({
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
    setCollectionName("");
    setVisibility("PRIVATE");
    setEditingCollection(null);
    setError(null);
  };

  // Handle edit collection
  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setVisibility(collection.visibility as "PRIVATE" | "SHARED");
    setIsOpen(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!collectionName.trim()) {
      setError("Collection name is required");
      return;
    }

    try {
      if (editingCollection) {
        await updateCollection.mutateAsync({
          id: editingCollection.id,
          name: collectionName.trim(),
          visibility,
        });
      } else {
        await createCollection.mutateAsync({
          name: collectionName.trim(),
          visibility,
        });
      }
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await deleteCollection.mutateAsync({ id });
    }
  };

  // Open dialog for new collection
  const openNewCollectionDialog = () => {
    setEditingCollection(null);
    setCollectionName("");
    setVisibility("PRIVATE");
    setIsOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Collections</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={openNewCollectionDialog}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Collection
            </button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollection ? "Edit Collection" : "Create New Collection"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="collectionName" className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  id="collectionName"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter collection name"
                />
              </div>
              
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "PRIVATE" | "SHARED")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="SHARED">Shared</option>
                </select>
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
                  {editingCollection ? "Save Changes" : "Create Collection"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {collectionsQuery.isLoading ? (
        <div className="text-center py-8">Loading collections...</div>
      ) : !collections || collections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No collections found. Create your first collection by clicking the "Add Collection" button.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection Name</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell>
                  <Badge 
                    variant={collection.visibility === "PRIVATE" ? "secondary" : "blue"}
                    className="font-normal"
                  >
                    {collection.visibility === "PRIVATE" ? "Private" : "Shared"}
                  </Badge>
                </TableCell>
                <TableCell>{collection._count.links}</TableCell>
                <TableCell className="text-right space-x-2">
                  <button
                    onClick={() => handleEditCollection(collection)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="text-red-600 hover:text-red-800"
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