import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Linkedin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const StudentCard = ({ student }: { student: any }) => (
  <Card className="card-enhanced">
    <CardHeader className="pb-4">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={student.image_url} alt={student.name} />
            <AvatarFallback className="text-lg font-semibold">
              {student.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="heading-tertiary truncate">{student.name}</CardTitle>
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

const StudentGrid = ({ students, emptyMessage }: { students: any[]; emptyMessage: string }) => (
  students.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-xl text-muted-foreground">{emptyMessage}</p>
    </div>
  )
);

export const Students = () => {
  const { ref, isVisible } = useScrollAnimation();
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

  const tabs = useMemo(() => {
    const all = students || [];
    return [
      { value: 'ongoing', label: 'Ongoing', data: all.filter(s => s.status === 'ongoing'), empty: 'No ongoing students listed.' },
      { value: 'completed', label: 'Completed', data: all.filter(s => s.status === 'completed'), empty: 'No completed students listed.' },
      { value: 'undergraduate', label: 'UG', data: all.filter(s => s.degree_level === 'undergraduate'), empty: 'No undergraduate students listed.' },
      { value: 'masters', label: 'Masters', data: all.filter(s => s.degree_level === 'masters'), empty: 'No masters students listed.' },
      { value: 'phd', label: 'PhD', data: all.filter(s => s.degree_level === 'phd'), empty: 'No PhD students listed.' },
      { value: 'interns', label: 'Interns', data: all.filter(s => s.degree_level === 'intern'), empty: 'No interns listed.' },
    ];
  }, [students]);

  if (isLoading) {
    return (
      <section id="students" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="heading-secondary text-center mb-12">Students</h2>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="students" ref={ref} className={`section-padding bg-gradient-hero transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="container-custom">
        <h2 className="heading-secondary text-center mb-12">Students</h2>
        
        <Tabs defaultValue="ongoing" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 w-full justify-start sm:grid sm:grid-cols-3 lg:grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label} ({tab.data.length})
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-8">
              <StudentGrid students={tab.data} emptyMessage={tab.empty} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
