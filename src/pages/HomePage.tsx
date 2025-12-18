import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { Sidebar, Toast, ArticleList } from '../components';
import { useToast } from '../hooks/useToast';

function HomePage() {
  const { feedId } = useParams<{ feedId: string }>();
  const { feeds, articles, activeFeedId, setActiveFeedId, initializeFromStorage } = useAppStore();
  const { toast, showToast, hideToast } = useToast();

  // 初始化：从 LocalStorage 加载数据
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // 同步 URL 参数和状态
  useEffect(() => {
    if (feedId) {
      setActiveFeedId(feedId);
    } else {
      setActiveFeedId(undefined);
    }
  }, [feedId, setActiveFeedId]);

  // 处理订阅源选择
  const handleFeedSelect = (feedId: string) => {
    setActiveFeedId(feedId);
  };

  // 获取当前选中的订阅源
  const activeFeed = activeFeedId ? feeds.find(f => f.id === activeFeedId) : undefined;

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <Sidebar
        feeds={feeds}
        activeFeedId={activeFeedId}
        onFeedSelect={handleFeedSelect}
        onShowToast={showToast}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="max-w-4xl mx-auto w-full p-6">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeFeed ? activeFeed.title : '所有文章'}
            </h1>
            {activeFeed?.description && (
              <p className="text-gray-600">{activeFeed.description}</p>
            )}
          </div>
        </div>

        {/* 文章列表 - 占据剩余空间 */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-6">
          <ArticleList
            articles={articles}
            feeds={feeds}
            activeFeedId={activeFeedId}
          />
        </div>
      </div>

      {/* Toast 通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default HomePage;
