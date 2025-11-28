import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { MagicLinkScreen } from './components/MagicLinkScreen';
import { ProjectsListScreen } from './components/ProjectsListScreen';
import { CreateProjectScreen } from './components/CreateProjectScreen';
import { ProjectDetailScreen } from './components/ProjectDetailScreen';
import { CameraScreen } from './components/CameraScreen';
import { PhotoDetailScreen } from './components/PhotoDetailScreen';
import { SyncQueueScreen } from './components/SyncQueueScreen';
import { CreateTaskScreen } from './components/CreateTaskScreen';
import { TaskDetailScreen } from './components/TaskDetailScreen';
import { CreateReportScreen } from './components/CreateReportScreen';
import { ReportDetailScreen } from './components/ReportDetailScreen';
import { CreateRoomScreen } from './components/CreateRoomScreen';
import { RoomDetailScreen } from './components/RoomDetailScreen';
import { UploadFloorPlanScreen } from './components/UploadFloorPlanScreen';
import { AnnotateFloorPlanScreen } from './components/AnnotateFloorPlanScreen';
import { FloorPlanViewScreen } from './components/FloorPlanViewScreen';

export type Screen = 
  | 'welcome' 
  | 'login' 
  | 'magic-link' 
  | 'projects-list' 
  | 'create-project'
  | 'project-detail'
  | 'camera'
  | 'photo-detail'
  | 'sync-queue'
  | 'create-task'
  | 'task-detail'
  | 'create-report'
  | 'report-detail'
  | 'create-room'
  | 'room-detail'
  | 'upload-floor-plan'
  | 'annotate-floor-plan'
  | 'floor-plan-view';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isOffline, setIsOffline] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Mobile Frame */}
      <div className="relative w-full max-w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-11 bg-white z-50 flex items-center justify-between px-6">
          <span className="text-sm">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-3 border border-gray-800 rounded-sm relative">
              <div className="absolute inset-0.5 bg-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div className="absolute top-11 left-0 right-0 bg-yellow-100 border-b border-yellow-300 px-4 py-2 z-40 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm">Mode hors ligne activé</span>
          </div>
        )}

        {/* Screen Content */}
        <div className="pt-11 h-full overflow-y-auto">
          {currentScreen === 'welcome' && <WelcomeScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'login' && <LoginScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'magic-link' && <MagicLinkScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'projects-list' && (
            <ProjectsListScreen onNavigate={setCurrentScreen} isOffline={isOffline} />
          )}
          {currentScreen === 'create-project' && <CreateProjectScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'project-detail' && (
            <ProjectDetailScreen onNavigate={setCurrentScreen} isOffline={isOffline} />
          )}
          {currentScreen === 'camera' && <CameraScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'photo-detail' && <PhotoDetailScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'sync-queue' && <SyncQueueScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'create-task' && <CreateTaskScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'task-detail' && <TaskDetailScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'create-report' && <CreateReportScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'report-detail' && <ReportDetailScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'create-room' && <CreateRoomScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'room-detail' && <RoomDetailScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'upload-floor-plan' && <UploadFloorPlanScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'annotate-floor-plan' && <AnnotateFloorPlanScreen onNavigate={setCurrentScreen} />}
          {currentScreen === 'floor-plan-view' && <FloorPlanViewScreen onNavigate={setCurrentScreen} />}
        </div>

        {/* Navigation Helper - Bottom Tabs */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50">
          <div className="flex gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="px-2 py-1 bg-gray-100 rounded whitespace-nowrap hover:bg-gray-200"
            >
              Welcome
            </button>
            <button
              onClick={() => setCurrentScreen('projects-list')}
              className="px-2 py-1 bg-gray-100 rounded whitespace-nowrap hover:bg-gray-200"
            >
              Projets
            </button>
            <button
              onClick={() => setCurrentScreen('project-detail')}
              className="px-2 py-1 bg-gray-100 rounded whitespace-nowrap hover:bg-gray-200"
            >
              Détail
            </button>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className="px-2 py-1 bg-blue-100 rounded whitespace-nowrap hover:bg-blue-200"
            >
              {isOffline ? '📶 Online' : '⚡ Offline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}