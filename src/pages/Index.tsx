import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Research } from "@/components/Research";
import { Publications } from "@/components/Publications";
import { Students } from "@/components/Students";

import { Contact } from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Research />
      <Publications />
      <Students />
      <Contact />
    </div>
  );
};

export default Index;
