import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Research } from "@/components/Research";
import { Publications } from "@/components/Publications";
import { Students } from "@/components/Students";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { Suspense, lazy } from "react";

// Lazy load components that are below the fold
const LazyStudents = lazy(() => import("@/components/Students").then(module => ({ default: module.Students })));
const LazyGallery = lazy(() => import("@/components/Gallery").then(module => ({ default: module.Gallery })));
const LazyContact = lazy(() => import("@/components/Contact").then(module => ({ default: module.Contact })));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Research />
      <Publications />
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <LazyStudents />
      </Suspense>
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <LazyGallery />
      </Suspense>
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <LazyContact />
      </Suspense>
    </div>
  );
};

export default Index;
