import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, GripVertical, Upload } from "lucide-react";

const gallerySchema = z.object({
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  image_file: z.any().optional(),
  alt_text: z.string().optional().or(z.literal("")),
  display_order: z.number().min(0),
  is_active: z.boolean().default(true),
});

type GalleryForm = z.infer<typeof gallerySchema>;

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const GalleryManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ['admin-gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const form = useForm<GalleryForm>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      title: "",
      description: "",
      alt_text: "",
      display_order: 0,
      is_active: true,
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createImageMutation = useMutation({
    mutationFn: async (data: GalleryForm) => {
      let imageUrl = '';
      
      if (selectedFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(selectedFile);
      }

      const insertData = {
        title: data.title,
        description: data.description || null,
        image_url: imageUrl,
        alt_text: data.alt_text || null,
        display_order: data.display_order,
        is_active: data.is_active,
      };
      
      const { error } = await supabase.from('gallery').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Success",
        description: "Gallery image added successfully!",
      });
      setIsDialogOpen(false);
      setSelectedFile(null);
      form.reset();
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add gallery image. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating gallery image:', error);
      setIsUploading(false);
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GalleryForm }) => {
      let imageUrl = editingImage?.image_url || '';
      
      if (selectedFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(selectedFile);
      }

      const updateData = {
        title: data.title,
        description: data.description || null,
        image_url: imageUrl,
        alt_text: data.alt_text || null,
        display_order: data.display_order,
        is_active: data.is_active,
      };
      
      const { error } = await supabase
        .from('gallery')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Success",
        description: "Gallery image updated successfully!",
      });
      setIsDialogOpen(false);
      setEditingImage(null);
      setSelectedFile(null);
      form.reset();
      setIsUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update gallery image. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating gallery image:', error);
      setIsUploading(false);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete gallery image with ID:', id);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First, get the image record to extract the file path
      const { data: imageRecord, error: fetchError } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching image record:', fetchError);
        throw fetchError;
      }
      
      // Extract file path from the storage URL
      let filePath = '';
      if (imageRecord?.image_url) {
        // Extract the file path from the full URL
        // URL format: https://[project-ref].supabase.co/storage/v1/object/public/gallery-images/[filename]
        const urlParts = imageRecord.image_url.split('/');
        filePath = urlParts[urlParts.length - 1]; // Get the filename
      }
      
      // Delete the file from storage if we have a file path
      if (filePath) {
        console.log('Deleting file from storage:', filePath);
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Don't throw here - continue with database deletion even if storage fails
        } else {
          console.log('File deleted from storage successfully');
        }
      }
      
      // Delete the database record
      const { data, error } = await supabase.from('gallery').delete().eq('id', id);
      console.log('Delete result:', { data, error });
      
      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Delete successful:', data);
      queryClient.invalidateQueries({ queryKey: ['admin-gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      toast({
        title: "Success",
        description: "Gallery image and file deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to delete gallery image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setSelectedFile(null);
    form.reset({
      title: image.title,
      description: image.description || "",
      alt_text: image.alt_text || "",
      display_order: image.display_order,
      is_active: image.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingImage(null);
    setSelectedFile(null);
    const nextOrder = images ? Math.max(...images.map(img => img.display_order), -1) + 1 : 0;
    form.reset({
      title: "",
      description: "",
      alt_text: "",
      display_order: nextOrder,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: GalleryForm) => {
    if (!editingImage && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (editingImage) {
      updateImageMutation.mutate({ id: editingImage.id, data });
    } else {
      createImageMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading gallery images...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-muted-foreground">Manage gallery images and their display order</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? "Edit Gallery Image" : "Add New Gallery Image"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter image description"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Image Upload</FormLabel>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                  {editingImage && !selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Leave empty to keep current image
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="alt_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Descriptive text for accessibility"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this image in the gallery
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createImageMutation.isPending || updateImageMutation.isPending || isUploading}
                  >
                    {isUploading ? "Uploading..." : editingImage ? "Update" : "Create"} Image
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {images && images.length > 0 ? (
          images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                  </div>
                  <div className="flex-shrink-0 w-20 h-20">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.title}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{image.title}</h3>
                        {image.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Order: {image.display_order}</span>
                          <span className={`px-2 py-1 rounded ${image.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {image.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(image)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                          disabled={deleteImageMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No gallery images yet.</p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};