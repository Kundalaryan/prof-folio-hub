import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GraduationCap } from "lucide-react";

export const Publications = () => {
  const { data: publications, isLoading } = useQuery({
    queryKey: ['publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('year', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="publications" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Publications</h2>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
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

  const PublicationCard = ({ publication }: { publication: any }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">{publication.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="font-medium">Authors:</span> {publication.authors}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {publication.journal && (
                <Badge variant="outline">
                  {publication.journal}
                </Badge>
              )}
              {publication.year && (
                <Badge variant="secondary">
                  {publication.year}
                </Badge>
              )}
              {publication.publication_type && (
                <Badge variant="outline">
                  {publication.publication_type.charAt(0).toUpperCase() + publication.publication_type.slice(1)}
                </Badge>
              )}
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {publication.abstract && (
          <p className="text-sm text-muted-foreground mb-4">
            {publication.abstract}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {publication.doi && (
            <span>DOI: {publication.doi}</span>
          )}
          {publication.citation_count > 0 && (
            <span>• Citations: {publication.citation_count}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="publications" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Publications</h2>
          <Button 
            asChild 
            size="lg"
            className="mb-8"
          >
            <a 
              href="https://scholar.google.co.in/citations?user=AgLr5dcAAAAJ&hl=en" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <GraduationCap className="h-5 w-5" />
              View Google Scholar Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
        
        {publications && publications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {publications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No publications listed yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};