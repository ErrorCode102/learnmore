import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';
import { useProgress } from '../hooks/useProgress';

type ClassroomProgress = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ClassroomProgress | undefined>(undefined);

export function ProgressProvider({ children }: PropsWithChildren) {
  const progress = useProgress();

  return <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>;
}

export function useClassroomProgress(): ClassroomProgress {
  const progress = useContext(ProgressContext);

  if (!progress) {
    throw new Error('useClassroomProgress must be used within a ProgressProvider.');
  }

  return progress;
}
