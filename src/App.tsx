// src/App.tsx
import Providers from './app/providers'
import { Layout } from './components/layout/Layout'
import { useOnboarding } from './hooks/useOnboarding'
import OnboardingModal from './components/OnboardingModal'

function App() {
  const { isOnboardingOpen, completeOnboarding } = useOnboarding();

  return (
    <Providers>
      <Layout />
      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onComplete={completeOnboarding} 
      />
    </Providers>
  )
}

export default App