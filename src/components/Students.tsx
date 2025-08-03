import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Linkedin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Students = () => {
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('year_started', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="students" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const currentStudents = students?.filter(s => s.status === 'current') || [];
  const graduatedStudents = students?.filter(s => s.status === 'graduated') || [];
  const alumni = students?.filter(s => s.status === 'alumni') || [];

  const StudentCard = ({ student }: { student: any }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.image_url || "/placeholder.svg"} alt={student.name} />
            <AvatarFallback>
              {student.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{student.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {student.degree_level.charAt(0).toUpperCase() + student.degree_level.slice(1)}
              </Badge>
              {student.year_started && (
                <Badge variant="secondary">
                  {student.year_started}
                  {student.graduation_year && ` - ${student.graduation_year}`}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {student.linkedin_url && (
              <Button variant="ghost" size="icon" asChild>
                <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {student.website_url && (
              <Button variant="ghost" size="icon" asChild>
                <a href={student.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {student.program && (
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Program:</span> {student.program}
          </p>
        )}
        
        {student.research_area && (
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Research Area:</span> {student.research_area}
          </p>
        )}
        
        {student.thesis_title && (
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Thesis:</span> {student.thesis_title}
          </p>
        )}
        
        {student.bio && (
          <p className="text-sm text-muted-foreground mt-4">{student.bio}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <section id="students" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Students</h2>
        
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current ({currentStudents.length})</TabsTrigger>
            <TabsTrigger value="graduated">Graduated ({graduatedStudents.length})</TabsTrigger>
            <TabsTrigger value="alumni">Alumni ({alumni.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="mt-8">
            {currentStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No current students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="graduated" className="mt-8">
            {graduatedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {graduatedStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No graduated students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alumni" className="mt-8">
            {alumni.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No alumni listed.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};