import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Save, X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const publicationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  authors: z.string().min(2, "Authors must be at least 2 characters"),
  journal: z.string().optional(),
  year: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  abstract: z.string().optional(),
  citation_count: z.string().optional(),
  publication_type: z.enum(['journal', 'conference', 'book', 'chapter', 'preprint', 'other']),
});

type PublicationForm = z.infer<typeof publicationSchema>;

export const PublicationsManager = () => {
  const [editingPublication, setEditingPublication] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: publications, isLoading } = useQuery({
    queryKey: ['admin-publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<PublicationForm>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: "",
      authors: "",
      journal: "",
      year: "",
      doi: "",
      url: "",
      abstract: "",
      citation_count: "",
      publication_type: "journal",
    },
  });

  const createPublicationMutation = useMutation({
    mutationFn: async (data: PublicationForm) => {
      const publicationData = {
        title: data.title,
        authors: data.authors,
        journal: data.journal || null,
        year: data.year ? parseInt(data.year) : null,
        doi: data.doi || null,
        url: data.url || null,
        abstract: data.abstract || null,
        citation_count: data.citation_count ? parseInt(data.citation_count) : 0,
        publication_type: data.publication_type,
      };

      const { error } = await supabase
        .from('publications')
        .insert(publicationData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      toast({
        title: "Publication added successfully",
        description: "The publication has been added to your portfolio.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding publication",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePublicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PublicationForm }) => {
      const publicationData = {
        title: data.title,
        authors: data.authors,
        journal: data.journal || null,
        year: data.year ? parseInt(data.year) : null,
        doi: data.doi || null,
        url: data.url || null,
        abstract: data.abstract || null,
        citation_count: data.citation_count ? parseInt(data.citation_count) : 0,
        publication_type: data.publication_type,
      };

      const { error } = await supabase
        .from('publications')
        .update(publicationData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      toast({
        title: "Publication updated successfully",
        description: "The changes have been saved.",
      });
      setEditingPublication(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating publication",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePublicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-publications'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      toast({
        title: "Publication removed successfully",
        description: "The publication has been removed from your portfolio.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing publication",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (publication: any) => {
    setEditingPublication(publication);
    form.reset({
      title: publication.title || "",
      authors: publication.authors || "",
      journal: publication.journal || "",
      year: publication.year ? publication.year.toString() : "",
      doi: publication.doi || "",
      url: publication.url || "",
      abstract: publication.abstract || "",
      citation_count: publication.citation_count ? publication.citation_count.toString() : "",
      publication_type: publication.publication_type || "journal",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPublication(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: PublicationForm) => {
    if (editingPublication) {
      updatePublicationMutation.mutate({ id: editingPublication.id, data });
    } else {
      createPublicationMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Publications ({publications?.length || 0} total)
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPublication ? "Edit Publication" : "Add New Publication"}
              </DialogTitle>
              <DialogDescription>
                {editingPublication 
                  ? "Update the publication information." 
                  : "Add a new publication to your portfolio."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Publication title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe, Jane Smith, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="journal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Journal/Conference</FormLabel>
                        <FormControl>
                          <Input placeholder="Nature, Science, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publication_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="journal">Journal Article</SelectItem>
                            <SelectItem value="conference">Conference Paper</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="chapter">Book Chapter</SelectItem>
                            <SelectItem value="preprint">Preprint</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="doi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOI</FormLabel>
                        <FormControl>
                          <Input placeholder="10.1000/example" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="citation_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Citation Count</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/publication" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Publication abstract..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPublicationMutation.isPending || updatePublicationMutation.isPending}
                  >
                    {(createPublicationMutation.isPending || updatePublicationMutation.isPending) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingPublication ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingPublication ? "Update Publication" : "Create Publication"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {publications?.map((publication) => (
          <Card key={publication.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight">{publication.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {publication.authors}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {publication.journal && (
                      <Badge variant="outline">{publication.journal}</Badge>
                    )}
                    {publication.year && (
                      <Badge variant="secondary">{publication.year}</Badge>
                    )}
                    <Badge variant="outline">
                      {publication.publication_type.charAt(0).toUpperCase() + publication.publication_type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {publication.url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={publication.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(publication)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePublicationMutation.mutate(publication.id)}
                    disabled={deletePublicationMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {publication.abstract && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{publication.abstract}</p>
                {(publication.doi || publication.citation_count > 0) && (
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {publication.doi && <span>DOI: {publication.doi}</span>}
                    {publication.citation_count > 0 && <span>Citations: {publication.citation_count}</span>}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

        {(!publications || publications.length === 0) && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No publications added yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Add Publication" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};