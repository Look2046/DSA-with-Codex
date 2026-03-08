import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getModuleByRoute } from '../data/moduleRegistry';
import { usePlaybackStore } from '../store/playbackStore';

export function useCurrentModule() {
  const location = useLocation();
  const currentModule = usePlaybackStore((state) => state.currentModule);
  const setCurrentModule = usePlaybackStore((state) => state.setCurrentModule);

  useEffect(() => {
    const resolved = getModuleByRoute(location.pathname);
    setCurrentModule(resolved);
  }, [location.pathname, setCurrentModule]);

  return currentModule;
}
