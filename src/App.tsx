import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import HomePage from './pages/HomePage';
import ReaderPage from './pages/ReaderPage';

function App() {
  const initializeFromStorage = useAppStore((state) => state.initializeFromStorage);

  // 初始化：从 LocalStorage 加载数据
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed/:feedId" element={<HomePage />} />
        <Route path="/article/:articleId" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
