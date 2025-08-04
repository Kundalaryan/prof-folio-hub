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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  degree_level: z.enum(['undergraduate', 'masters', 'phd', 'intern']),
  program: z.string().optional(),
  year_started: z.string().optional(),
  graduation_year: z.string().optional(),
  research_area: z.string().optional(),
  thesis_title: z.string().optional(),
  status: z.enum(['current', 'graduated', 'alumni', 'completed', 'ongoing']),
  bio: z.string().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type StudentForm = z.infer<typeof studentSchema>;

export const StudentsManager = () => {
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      degree_level: "undergraduate",
      program: "",
      year_started: "",
      graduation_year: "",
      research_area: "",
      thesis_title: "",
      status: "current",
      bio: "",
      image_url: "",
      linkedin_url: "",
      website_url: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentForm) => {
      const studentData = {
        name: data.name,
        degree_level: data.degree_level,
        program: data.program,
        research_area: data.research_area,
        thesis_title: data.thesis_title,
        status: data.status,
        bio: data.bio,
        year_started: data.year_started ? parseInt(data.year_started) : null,
        graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
        email: data.email || null,
        image_url: data.image_url || null,
        linkedin_url: data.linkedin_url || null,
        website_url: data.website_url || null,
      };

      const { error } = await supabase
        .from('students')
        .insert(studentData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student added successfully",
        description: "The student has been added to your portfolio.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding student",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StudentForm }) => {
      const studentData = {
        ...data,
        year_started: data.year_started ? parseInt(data.year_started) : null,
        graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
        email: data.email || null,
        image_url: data.image_url || null,
        linkedin_url: data.linkedin_url || null,
        website_url: data.website_url || null,
      };

      const { error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student updated successfully",
        description: "The changes have been saved.",
      });
      setEditingStudent(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating student",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Student removed successfully",
        description: "The student has been removed from your portfolio.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing student",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    form.reset({
      name: student.name || "",
      email: student.email || "",
      degree_level: student.degree_level || "undergraduate",
      program: student.program || "",
      year_started: student.year_started ? student.year_started.toString() : "",
      graduation_year: student.graduation_year ? student.graduation_year.toString() : "",
      research_area: student.research_area || "",
      thesis_title: student.thesis_title || "",
      status: student.status || "current",
      bio: student.bio || "",
      image_url: student.image_url || "",
      linkedin_url: student.linkedin_url || "",
      website_url: student.website_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: StudentForm) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, data });
    } else {
      createStudentMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentStudents = students?.filter(s => s.status === 'current') || [];
  const graduatedStudents = students?.filter(s => s.status === 'graduated') || [];
  const alumni = students?.filter(s => s.status === 'alumni') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Students ({students?.length || 0} total)
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? "Update the student's information." 
                  : "Add a new student to your portfolio."
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@university.edu" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="degree_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select degree level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="masters">Masters</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="graduated">Graduated</SelectItem>
                            <SelectItem value="alumni">Alumni</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program</FormLabel>
                        <FormControl>
                          <Input placeholder="Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="year_started"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Started</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="graduation_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2027" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="research_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Research Area</FormLabel>
                      <FormControl>
                        <Input placeholder="Machine Learning, Computer Vision, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thesis_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thesis Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title of thesis or research project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief biography or background..."
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
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/photo.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
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
                    disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
                  >
                    {(createStudentMutation.isPending || updateStudentMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingStudent ? "Update" : "Add"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {currentStudents.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Current Students ({currentStudents.length})</h4>
            <div className="grid gap-3">
              {currentStudents.map((student) => (
                <Card key={student.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.image_url || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {student.degree_level.charAt(0).toUpperCase() + student.degree_level.slice(1)}
                            </Badge>
                            {student.year_started && (
                              <span className="text-xs text-muted-foreground">
                                {student.year_started}
                                {student.graduation_year && ` - ${student.graduation_year}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteStudentMutation.mutate(student.id)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {graduatedStudents.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Graduated Students ({graduatedStudents.length})</h4>
            <div className="grid gap-3">
              {graduatedStudents.map((student) => (
                <Card key={student.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.image_url || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {student.degree_level.charAt(0).toUpperCase() + student.degree_level.slice(1)}
                            </Badge>
                            {student.year_started && (
                              <span className="text-xs text-muted-foreground">
                                {student.year_started}
                                {student.graduation_year && ` - ${student.graduation_year}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteStudentMutation.mutate(student.id)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {alumni.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Alumni ({alumni.length})</h4>
            <div className="grid gap-3">
              {alumni.map((student) => (
                <Card key={student.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.image_url || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {student.degree_level.charAt(0).toUpperCase() + student.degree_level.slice(1)}
                            </Badge>
                            {student.year_started && (
                              <span className="text-xs text-muted-foreground">
                                {student.year_started}
                                {student.graduation_year && ` - ${student.graduation_year}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteStudentMutation.mutate(student.id)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {students && students.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No students added yet. Add your first student!</p>
          </div>
        )}
      </div>
    </div>
  );
};