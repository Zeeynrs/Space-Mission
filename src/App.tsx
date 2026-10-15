import { useEffect } from 'react';
import { useMissionStore } from './store/useMissionStore';
import { NavigationHeader } from './components/NavigationHeader';
import { TitleScreen } from './features/title-entry/TitleScreen';
import { MissionBriefingView } from './features/mission-briefing/MissionBriefingView';
import { SpacecraftBuilderView } from './features/spacecraft-builder/SpacecraftBuilderView';
import { MissionOperationsView } from './features/mission-operations/MissionOperationsView';
import { MissionReportView } from './features/mission-report/MissionReportView';
import { DataSourcesView } from './features/data-sources/DataSourcesView';

export function App() {
  const { activeScreen, togglePause, setTimeScale } = useMissionStore();

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is editing input (e.g. spacecraft name or seed)
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' && activeScreen === 'operations') {
        e.preventDefault();
        togglePause();
      } else if (e.key === '1' && activeScreen === 'operations') {
        setTimeScale(1);
      } else if (e.key === '2' && activeScreen === 'operations') {
        setTimeScale(2);
      } else if (e.key === '5' && activeScreen === 'operations') {
        setTimeScale(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeScreen, togglePause, setTimeScale]);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan selection:text-space-950">
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Screen Router */}
      <main className="flex-1 w-full pb-8">
        {activeScreen === 'title' && <TitleScreen />}
        {activeScreen === 'briefing' && <MissionBriefingView />}
        {activeScreen === 'builder' && <SpacecraftBuilderView />}
        {activeScreen === 'operations' && <MissionOperationsView />}
        {activeScreen === 'debrief' && <MissionReportView />}
        {activeScreen === 'sources' && <DataSourcesView />}
      </main>
    </div>
  );
}

export default App;
