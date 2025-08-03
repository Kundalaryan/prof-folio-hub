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
import { Loader2, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  status: z.enum(['ongoing', 'completed', 'planned']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  funding_source: z.string().optional(),
  funding_amount: z.string().optional(),
  collaborators: z.string().optional(),
  publications: z.string().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  project_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProjectForm = z.infer<typeof projectSchema>;

export const ResearchManager = () => {
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-research-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      detailed_description: "",
      status: "ongoing",
      start_date: "",
      end_date: "",
      funding_source: "",
      funding_amount: "",
      collaborators: "",
      publications: "",
      image_url: "",
      project_url: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      const projectData = {
        title: data.title,
        description: data.description,
        detailed_description: data.detailed_description,
        status: data.status,
        funding_source: data.funding_source,
        funding_amount: data.funding_amount ? parseFloat(data.funding_amount) : null,
        collaborators: data.collaborators ? data.collaborators.split(',').map(c => c.trim()) : null,
        publications: data.publications ? data.publications.split('\n').filter(p => p.trim()) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        image_url: data.image_url || null,
        project_url: data.project_url || null,
      };

      const { error } = await supabase
        .from('research_projects')
        .insert(projectData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      toast({
        title: "Project created successfully",
        description: "Your research project has been added.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectForm }) => {
      const projectData = {
        ...data,
        funding_amount: data.funding_amount ? parseFloat(data.funding_amount) : null,
        collaborators: data.collaborators ? data.collaborators.split(',').map(c => c.trim()) : null,
        publications: data.publications ? data.publications.split('\n').filter(p => p.trim()) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        image_url: data.image_url || null,
        project_url: data.project_url || null,
      };

      const { error } = await supabase
        .from('research_projects')
        .update(projectData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      toast({
        title: "Project updated successfully",
        description: "Your changes have been saved.",
      });
      setEditingProject(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('research_projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-research-projects'] });
      queryClient.invalidateQueries({ queryKey: ['research-projects'] });
      toast({
        title: "Project deleted successfully",
        description: "The research project has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (project: any) => {
    setEditingProject(project);
    form.reset({
      title: project.title || "",
      description: project.description || "",
      detailed_description: project.detailed_description || "",
      status: project.status || "ongoing",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      funding_source: project.funding_source || "",
      funding_amount: project.funding_amount ? project.funding_amount.toString() : "",
      collaborators: project.collaborators ? project.collaborators.join(', ') : "",
      publications: project.publications ? project.publications.join('\n') : "",
      image_url: project.image_url || "",
      project_url: project.project_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ProjectForm) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    } else {
      createProjectMutation.mutate(data);
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
        <h3 className="text-lg font-semibold">Research Projects ({projects?.length || 0})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Research Project" : "Add New Research Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject 
                  ? "Update the details of your research project." 
                  : "Add a new research project to your portfolio."
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
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="My Research Project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="funding_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Source</FormLabel>
                        <FormControl>
                          <Input placeholder="NSF, NIH, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the project..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detailed_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the project, methodology, goals, etc..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="funding_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="collaborators"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collaborators</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jane Smith, Prof. John Doe (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List publications related to this project (one per line)..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/project" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                    disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                  >
                    {(createProjectMutation.isPending || updateProjectMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingProject ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        project.status === 'ongoing' ? 'default' :
                        project.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {project.status}
                      </Badge>
                      {project.funding_source && (
                        <Badge variant="outline">{project.funding_source}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteProjectMutation.mutate(project.id)}
                      disabled={deleteProjectMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {project.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                  {project.updated_at !== project.created_at && (
                    <> • Updated: {new Date(project.updated_at).toLocaleDateString()}</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No research projects yet. Add your first project!</p>
        </div>
      )}
    </div>
  );
};