// src/hooks/useOnboarding.ts

import { useState, useEffect } from 'react';
import { userProfileStorage } from '@/services/storage/userProfile';
import type { UserProfile } from '@/types/onboarding';

export function useOnboarding() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    // Check onboarding status on mount
    const savedProfile = userProfileStorage.get();
    
    if (savedProfile && savedProfile.hasCompleted) {
      setProfile(savedProfile);
      setHasCheckedOnboarding(true);
    } else {
      // Show onboarding modal if not completed
      setIsOnboardingOpen(true);
      setHasCheckedOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    const updatedProfile = userProfileStorage.get();
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    setIsOnboardingOpen(false);
  };

  const reopenOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const updateProfile = (updates: Partial<Omit<UserProfile, 'lastUpdated'>>) => {
    userProfileStorage.update(updates);
    const updatedProfile = userProfileStorage.get();
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  return {
    profile,
    isOnboardingOpen,
    hasCheckedOnboarding,
    completeOnboarding,
    reopenOnboarding,
    updateProfile,
    hasCompletedOnboarding: profile?.hasCompleted ?? false,
  };
}
