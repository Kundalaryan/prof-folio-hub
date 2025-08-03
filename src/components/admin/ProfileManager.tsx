import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  office_location: z.string().optional(),
  profile_image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileManagerProps {
  userId: string;
}

export const ProfileManager = ({ userId }: ProfileManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      title: "",
      department: "",
      bio: "",
      email: "",
      phone: "",
      office_location: "",
      profile_image_url: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        title: profile.title || "",
        department: profile.department || "",
        bio: profile.bio || "",
        email: profile.email || "",
        phone: profile.phone || "",
        office_location: profile.office_location || "",
        profile_image_url: profile.profile_image_url || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            ...data,
            email: data.email || null,
            profile_image_url: data.profile_image_url || null,
          })
          .eq('id', profile.id);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            full_name: data.full_name,
            title: data.title,
            department: data.department,
            bio: data.bio,
            phone: data.phone,
            office_location: data.office_location,
            user_id: userId,
            email: data.email || null,
            profile_image_url: data.profile_image_url || null,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Professor of Computer Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input placeholder="Department of Computer Science & Engineering" {...field} />
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
                  placeholder="Tell visitors about yourself, your research interests, and background..."
                  className="min-h-[120px]"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@university.edu" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="office_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Location</FormLabel>
              <FormControl>
                <Input placeholder="Room 123, Computer Science Building" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profile_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/your-photo.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={updateProfileMutation.isPending}
          className="w-full"
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};