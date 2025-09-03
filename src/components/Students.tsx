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
    queryKey: ['students-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_students_public')
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
                <Card key={i} className="animate-pulse border-border/50">
                <CardHeader className="pb-4">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-muted rounded w-16"></div>
                      <div className="h-5 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/5"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter by status: ongoing and completed  
  const ongoingStudents = students?.filter(s => s.status === 'ongoing') || [];
  const completedStudents = students?.filter(s => s.status === 'completed') || [];
  
  // Filter by degree level: undergraduate, masters, phd, intern
  const undergraduateStudents = students?.filter(s => s.degree_level === 'undergraduate') || [];
  const mastersStudents = students?.filter(s => s.degree_level === 'masters') || [];
  const phdStudents = students?.filter(s => s.degree_level === 'phd') || [];
  const internStudents = students?.filter(s => s.degree_level === 'intern') || [];

  const StudentCard = ({ student }: { student: any }) => (
    <Card className="card-enhanced">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.image_url} alt={student.name} />
              <AvatarFallback className="text-lg font-semibold">
                {student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="heading-tertiary">{student.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                {student.linkedin_url && (
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                    <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn Profile</span>
                    </a>
                  </Button>
                )}
                {student.website_url && (
                  <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
                    <a href={student.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Personal Website</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs font-medium">
              {student.degree_level.charAt(0).toUpperCase() + student.degree_level.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </Badge>
            {student.year_started && (
              <Badge variant="secondary" className="text-xs">
                {student.year_started}
                {student.graduation_year && ` - ${student.graduation_year}`}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
        <CardContent className="pt-0 space-y-3">
        <div className="grid gap-3">
          {student.program && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Program</span>
              <p className="text-sm text-foreground">{student.program}</p>
            </div>
          )}
          
          {student.research_area && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Research Area</span>
              <p className="text-sm text-foreground">{student.research_area}</p>
            </div>
          )}
          
          {student.thesis_title && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Thesis</span>
              <p className="text-sm text-foreground leading-relaxed">{student.thesis_title}</p>
            </div>
          )}
          
          {student.bio && (
            <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bio</span>
              <p className="text-sm text-foreground leading-relaxed">{student.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="students" className="section-padding bg-gradient-hero">
      <div className="container-custom">
        <h2 className="heading-secondary text-center mb-12 animate-fade-in">Students</h2>
        
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ongoing">Ongoing ({ongoingStudents.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedStudents.length})</TabsTrigger>
            <TabsTrigger value="undergraduate">Undergraduate ({undergraduateStudents.length})</TabsTrigger>
            <TabsTrigger value="masters">Masters ({mastersStudents.length})</TabsTrigger>
            <TabsTrigger value="phd">PhD ({phdStudents.length})</TabsTrigger>
            <TabsTrigger value="interns">Interns ({internStudents.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ongoing" className="mt-8">
            {ongoingStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No ongoing students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-8">
            {completedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No completed students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="undergraduate" className="mt-8">
            {undergraduateStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {undergraduateStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No undergraduate students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="masters" className="mt-8">
            {mastersStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mastersStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No masters students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="phd" className="mt-8">
            {phdStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phdStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No PhD students listed.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="interns" className="mt-8">
            {internStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No interns listed.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};