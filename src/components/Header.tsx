import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">Dr. Professor Name</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('research')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Research
            </button>
            <button
              onClick={() => scrollToSection('students')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Students
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => scrollToSection('about')}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('research')}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
              >
                Research
              </button>
              <button
                onClick={() => scrollToSection('students')}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
              >
                Students
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};