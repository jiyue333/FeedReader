import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import { ErrorBoundary } from './components/ErrorBoundary';

// 路由懒加载：按需加载页面组件，减少初始包大小
const HomePage = lazy(() => import('./pages/HomePage'));
const ReaderPage = lazy(() => import('./pages/ReaderPage'));

// 加载中组件
function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="text-gray-500">加载中...</div>
      </div>
    </div>
  );
}

function App() {
  const initializeFromStorage = useAppStore(
    (state) => state.initializeFromStorage
  );

  // 初始化：从 LocalStorage 加载数据
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/feed/:feedId" element={<HomePage />} />
            <Route path="/article/:articleId" element={<ReaderPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
