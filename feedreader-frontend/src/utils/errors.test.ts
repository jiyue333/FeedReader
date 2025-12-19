/**
 * 错误处理工具函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  NetworkError,
  StorageError,
  AIServiceError,
  TimeoutError,
  getErrorMessage,
  isRetryableError,
} from './errors';

describe('Custom Error Classes', () => {
  it('should create ValidationError with correct name', () => {
    const error = new ValidationError('Invalid input');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
  });

  it('should create NetworkError with correct name', () => {
    const error = new NetworkError('Connection failed');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Connection failed');
  });

  it('should create StorageError with correct name', () => {
    const error = new StorageError('Storage full');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('StorageError');
    expect(error.message).toBe('Storage full');
  });

  it('should create AIServiceError with correct name', () => {
    const error = new AIServiceError('AI service down');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AIServiceError');
    expect(error.message).toBe('AI service down');
  });

  it('should create TimeoutError with correct name', () => {
    const error = new TimeoutError('Request timeout');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TimeoutError');
    expect(error.message).toBe('Request timeout');
  });
});

describe('getErrorMessage', () => {
  it('should return ValidationError message as-is', () => {
    const error = new ValidationError('Invalid URL');
    expect(getErrorMessage(error)).toBe('Invalid URL');
  });

  it('should return user-friendly message for NetworkError', () => {
    const error = new NetworkError('Connection failed');
    expect(getErrorMessage(error)).toBe('网络连接失败，请检查网络设置');
  });

  it('should return user-friendly message for StorageError', () => {
    const error = new StorageError('Storage full');
    expect(getErrorMessage(error)).toBe('数据保存失败，请检查浏览器存储空间');
  });

  it('should return user-friendly message for AIServiceError', () => {
    const error = new AIServiceError('AI service down');
    expect(getErrorMessage(error)).toBe('AI 服务暂时不可用，请稍后重试');
  });

  it('should return user-friendly message for TimeoutError', () => {
    const error = new TimeoutError('Request timeout');
    expect(getErrorMessage(error)).toBe('请求超时，请稍后重试');
  });

  it('should return generic message for unknown Error', () => {
    const error = new Error('Some error');
    expect(getErrorMessage(error)).toBe('Some error');
  });

  it('should return generic message for non-Error objects', () => {
    expect(getErrorMessage('string error')).toBe('未知错误，请稍后重试');
    expect(getErrorMessage(null)).toBe('未知错误，请稍后重试');
    expect(getErrorMessage(undefined)).toBe('未知错误，请稍后重试');
  });
});

describe('isRetryableError', () => {
  it('should return true for NetworkError', () => {
    const error = new NetworkError('Connection failed');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for TimeoutError', () => {
    const error = new TimeoutError('Request timeout');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for AIServiceError', () => {
    const error = new AIServiceError('AI service down');
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for ValidationError', () => {
    const error = new ValidationError('Invalid input');
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for StorageError', () => {
    const error = new StorageError('Storage full');
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return false for generic Error', () => {
    const error = new Error('Some error');
    expect(isRetryableError(error)).toBe(false);
  });
});
