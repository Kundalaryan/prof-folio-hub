import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, DollarSign } from "lucide-react";

export const Research = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['research-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="research" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Research & Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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

  return (
    <section id="research" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Research & Projects</h2>
        
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="h-full flex flex-col">
                {project.image_url && (
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      project.status === 'ongoing' ? 'default' :
                      project.status === 'completed' ? 'secondary' : 'outline'
                    }>
                      {project.status}
                    </Badge>
                    {project.project_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  {project.detailed_description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.detailed_description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {project.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(project.start_date).getFullYear()}
                          {project.end_date && ` - ${new Date(project.end_date).getFullYear()}`}
                        </span>
                      </div>
                    )}
                    
                    {project.funding_source && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{project.funding_source}</span>
                        {project.funding_amount && (
                          <span className="font-medium">${project.funding_amount.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Collaborators:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.collaborators.map((collaborator, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {collaborator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.publications && project.publications.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Publications:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {project.publications.map((publication, index) => (
                          <li key={index} className="text-xs">{publication}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No research projects available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};