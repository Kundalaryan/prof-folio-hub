import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, User as UserIcon, BookOpen, Users, MessageSquare } from "lucide-react";
import { ProfileManager } from "@/components/admin/ProfileManager";
import { ResearchManager } from "@/components/admin/ResearchManager";
import { PublicationsManager } from "@/components/admin/PublicationsManager";
import { StudentsManager } from "@/components/admin/StudentsManager";
import { MessagesManager } from "@/components/admin/MessagesManager";
import type { User, Session } from '@supabase/supabase-js';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your portfolio content</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="publications" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Publications
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileManager userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="research" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Projects</CardTitle>
                  <CardDescription>
                    Add and manage your research projects, publications, and collaborations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResearchManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Publications Management</CardTitle>
                  <CardDescription>
                    Add and manage your academic publications, articles, and papers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PublicationsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Students Management</CardTitle>
                  <CardDescription>
                    Manage information about current students, graduates, and Researcher
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>
                    View and respond to messages from visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MessagesManager />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;