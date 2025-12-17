import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReaderPage from './pages/ReaderPage';

function App() {
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
