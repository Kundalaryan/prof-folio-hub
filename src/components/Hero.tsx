import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Hero = () => {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary mb-6">
              {profile?.full_name || "Dr. Professor Name"}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {profile?.title || "Professor of Computer Science"}
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              {profile?.department || "Department of Computer Science & Engineering"}
            </p>
            <div className="prose prose-lg max-w-none text-foreground">
              <p>
                {profile?.bio || 
                  "Welcome to my academic portfolio. I am dedicated to advancing research in computer science and mentoring the next generation of researchers and practitioners."
                }
              </p>
            </div>
            
            {profile && (
              <div className="mt-8 space-y-2">
                {profile.email && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Email:</span> {profile.email}
                  </p>
                )}
                {profile.phone && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Phone:</span> {profile.phone}
                  </p>
                )}
                {profile.office_location && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Office:</span> {profile.office_location}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <Card className="p-8 bg-white shadow-lg">
              <Avatar className="w-64 h-64 mx-auto">
                <AvatarImage 
                  src={profile?.profile_image_url || "/placeholder.svg"} 
                  alt={profile?.full_name || "Professor"} 
                />
                <AvatarFallback className="text-4xl">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || "PN"}
                </AvatarFallback>
              </Avatar>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};