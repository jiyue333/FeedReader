function HomePage() {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">订阅源</h2>
        <p className="text-gray-600">侧边栏占位</p>
      </div>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">文章列表</h1>
        <p className="text-gray-600">主内容区占位</p>
      </div>
    </div>
  );
}

export default HomePage;
