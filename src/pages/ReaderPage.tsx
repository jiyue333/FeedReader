import { useParams } from 'react-router-dom';

function ReaderPage() {
  const { articleId } = useParams<{ articleId: string }>();

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-lg font-bold mb-4">目录</h2>
        <p className="text-gray-600">目录占位</p>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">文章内容</h1>
        <p className="text-gray-600">文章 ID: {articleId}</p>
        <p className="text-gray-600">内容区占位</p>
      </div>
      <div className="w-80 bg-gray-50 p-4">
        <h2 className="text-lg font-bold mb-4">功能栏</h2>
        <p className="text-gray-600">笔记和AI聊天占位</p>
      </div>
    </div>
  );
}

export default ReaderPage;
