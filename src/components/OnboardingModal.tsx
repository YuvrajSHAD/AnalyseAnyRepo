// src/components/OnboardingModal.tsx
// Enhanced version with Discord-style animations
// FIXED: Changed "Start Exploring!" to "Go to Dashboard" - no auto-trigger

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Check, Sparkles, Code, Zap, Rocket } from 'lucide-react';
import { userProfileStorage } from '@/services/storage/userProfile';
import type { TechStack, KnowledgeLevel } from '@/types/onboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const TECH_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'Go', 'Rust',
  'Ruby', 'Rails', 'PHP', 'Laravel', 'C#', '.NET', 'Swift', 'Kotlin',
  'Flutter', 'React Native', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
];

const KNOWLEDGE_LEVELS: { value: KnowledgeLevel; label: string; description: string; color: string }[] = [
  { 
    value: 'beginner', 
    label: 'Beginner', 
    description: 'Learning the basics, exploring good first issues',
    color: 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: 'Comfortable with fundamentals, ready for features',
    color: 'bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20'
  },
  { 
    value: 'advanced', 
    label: 'Advanced', 
    description: 'Deep knowledge, can tackle complex issues',
    color: 'bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20'
  },
  { 
    value: 'expert', 
    label: 'Expert', 
    description: 'Mastery level, architecture and optimization work',
    color: 'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20'
  },
];

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const setKnowledgeLevel = (tech: string, level: KnowledgeLevel) => {
    setTechStack(prev => {
      const existing = prev.find(t => t.name === tech);
      if (existing) {
        return prev.map(t => t.name === tech ? { ...t, knowledgeLevel: level } : t);
      }
      return [...prev, { name: tech, knowledgeLevel: level }];
    });
  };

  const handleNext = () => {
    if (step === 1 && selectedSkills.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        const initialStack: TechStack[] = selectedSkills.map(skill => ({
          name: skill, knowledgeLevel: 'intermediate',
        }));
        setTechStack(initialStack);
        setStep(2);
        setIsAnimating(false);
      }, 300);
    } else if (step === 2) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(3);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      // Save profile data
      userProfileStorage.set({
        skills: selectedSkills,
        techStack,
        hasCompleted: true,
      });
      
      // IMPORTANT: Just close the modal - DO NOT trigger issue exploration
      // User will manually click "Start Exploring" in the sidebar after loading a repo
      onComplete();
    }, 500);
  };

  const canProceedStep1 = selectedSkills.length > 0;
  const canProceedStep2 = techStack.length === selectedSkills.length;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        hideCloseButton={true}
        className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/50 rounded-xl shadow-lg animate-pulse">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {step === 1 && "Welcome to ContextHub! 🎉"}
                {step === 2 && "Rate Your Knowledge 📚"}
                {step === 3 && "You're All Set! 🚀"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {step === 1 && "Select the technologies you're familiar with"}
                {step === 2 && "Rate your knowledge level for each skill"}
                {step === 3 && "We'll find the perfect issues for you"}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar with Animation */}
        <div className="flex gap-2 mt-6 relative z-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                s <= step 
                  ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/50' 
                  : 'bg-muted'
              } ${s === step ? 'animate-pulse' : ''}`}
            />
          ))}
        </div>

        {/* Content with Fade Animation */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-4 relative z-10 transition-opacity duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}>
          {/* Step 1: Select Skills */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech, index) => (
                  <Badge
                    key={tech}
                    variant={selectedSkills.includes(tech) ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-2.5 text-sm font-medium transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2`}
                    style={{ animationDelay: `${index * 20}ms` }}
                    onClick={() => toggleSkill(tech)}
                  >
                    {selectedSkills.includes(tech) && (
                      <Check className="h-3.5 w-3.5 mr-1.5 animate-in zoom-in-50 duration-200" />
                    )}
                    {tech}
                  </Badge>
                ))}
              </div>

              {selectedSkills.length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl backdrop-blur animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">
                      Selected ({selectedSkills.length}):
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill, index) => (
                      <Badge 
                        key={skill} 
                        variant="secondary" 
                        className="animate-in zoom-in-50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Rate Knowledge */}
          {step === 2 && (
            <div className="space-y-4">
              {selectedSkills.map((tech, index) => {
                const currentLevel = techStack.find(t => t.name === tech)?.knowledgeLevel;
                
                return (
                  <div 
                    key={tech} 
                    className="p-4 border-2 border-border rounded-xl space-y-3 bg-card/50 backdrop-blur animate-in fade-in-0 slide-in-from-right-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      <h3 className="font-bold text-base">{tech}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {KNOWLEDGE_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setKnowledgeLevel(tech, level.value)}
                          className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                            currentLevel === level.value
                              ? `${level.color} border-2 shadow-lg scale-105`
                              : 'border-border hover:border-primary/50 bg-background/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{level.label}</span>
                            {currentLevel === level.value && (
                              <Check className="h-4 w-4 text-primary animate-in zoom-in-50 duration-200" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-tight">
                            {level.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 3: Completion */}
          {step === 3 && (
            <div className="text-center py-12 space-y-8 animate-in fade-in-0 zoom-in-95 duration-500">
              <div className="inline-flex p-6 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse">
                <Zap className="h-16 w-16 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Ready to contribute!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                  We'll find issues that match your <span className="font-bold text-primary">{selectedSkills.length}</span> skill{selectedSkills.length !== 1 ? 's' : ''} and knowledge level.
                </p>
                <p className="text-sm text-muted-foreground">
                  Load a repository and click "Start Exploring" to find matched issues! 🎯
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/20 rounded-2xl max-w-md mx-auto backdrop-blur">
                <p className="text-sm font-semibold mb-4 flex items-center gap-2 justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Your Profile Summary
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {techStack.slice(0, 6).map((tech, index) => (
                    <Badge 
                      key={tech.name} 
                      variant="secondary" 
                      className="text-xs font-medium animate-in zoom-in-50"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tech.name} • {tech.knowledgeLevel}
                    </Badge>
                  ))}
                  {techStack.length > 6 && (
                    <Badge variant="outline" className="text-xs animate-in zoom-in-50">
                      +{techStack.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Animated Buttons */}
        <div className="flex justify-between items-center pt-6 border-t-2 border-border relative z-10">
          <Button
            variant="ghost"
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setStep(Math.max(1, step - 1));
                setIsAnimating(false);
              }, 200);
            }}
            disabled={step === 1 || isAnimating}
            className="transition-all hover:scale-105"
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={(step === 1 ? !canProceedStep1 : !canProceedStep2) || isAnimating}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 shadow-lg shadow-primary/50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete} 
              disabled={isAnimating}
              className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all hover:scale-105 shadow-lg shadow-primary/50"
            >
              <Check className="h-5 w-5" />
              Go to Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}