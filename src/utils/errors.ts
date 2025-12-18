/**
 * 自定义错误类
 * 用于统一处理不同类型的错误
 */

/**
 * 验证错误 - 用于输入验证失败
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 网络错误 - 用于网络请求失败
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 存储错误 - 用于 LocalStorage 操作失败
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * AI 服务错误 - 用于 AI API 调用失败
 */
export class AIServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * 超时错误 - 用于请求超时
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * 错误处理工具函数
 * 根据错误类型返回用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return '网络连接失败，请检查网络设置';
  }
  
  if (error instanceof StorageError) {
    return '数据保存失败，请检查浏览器存储空间';
  }
  
  if (error instanceof AIServiceError) {
    return 'AI 服务暂时不可用，请稍后重试';
  }
  
  if (error instanceof TimeoutError) {
    return '请求超时，请稍后重试';
  }
  
  if (error instanceof Error) {
    return error.message || '操作失败，请稍后重试';
  }
  
  return '未知错误，请稍后重试';
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    error instanceof AIServiceError
  );
}
