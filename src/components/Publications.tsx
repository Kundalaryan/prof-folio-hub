import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  abstract?: string;
  citation_count?: number;
  publication_type?: string;
}

export const Publications = () => {
  const { data: publications, isLoading } = useQuery({
    queryKey: ['publications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('year', { ascending: false })
        .limit(6); // Limit initial load
      
      if (error) throw error;
      return data as Publication[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Publications</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          </div>
          <div className="grid gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!publications || publications.length === 0) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Publications</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">No publications available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="publications" className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Publications</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            A selection of recent research publications and academic contributions
          </p>
        </div>

        <div className="grid gap-6 md:gap-8">
          {publications.map((publication) => (
            <div key={publication.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {publication.url ? (
                      <a 
                        href={publication.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {publication.title}
                      </a>
                    ) : (
                      publication.title
                    )}
                  </h3>
                  
                  <p className="text-muted-foreground mb-2">{publication.authors}</p>
                  
                  {publication.journal && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">{publication.journal}</span>
                      {publication.year && ` (${publication.year})`}
                    </p>
                  )}
                  
                  {publication.abstract && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {publication.abstract}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {publication.year && (
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {publication.year}
                    </span>
                  )}
                  
                  {publication.publication_type && (
                    <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs uppercase">
                      {publication.publication_type}
                    </span>
                  )}
                  
                  {publication.citation_count !== null && publication.citation_count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {publication.citation_count} citations
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};