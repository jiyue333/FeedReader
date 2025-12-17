/**
 * Mock AI 响应逻辑 - 基于关键词匹配
 */

interface AIResponseConfig {
  keywords: Record<string, string>;
  default: string;
}

const mockAIResponses: AIResponseConfig = {
  keywords: {
    总结: '根据文章内容，我为您总结如下：\n\n文章主要讨论了技术发展的趋势和实践经验。作者通过具体案例说明了关键概念，并提供了实用的代码示例。总的来说，这是一篇很有价值的技术文章，值得深入学习。',
    
    解释: '让我为您解释一下这个概念：\n\n这个技术/方法的核心思想是通过特定的方式来解决实际问题。它的优势在于能够提高效率和可维护性。在实际应用中，我们需要注意一些关键点，比如性能优化和错误处理。',
    
    代码: '关于代码部分，我注意到以下几点：\n\n1. 代码结构清晰，遵循了最佳实践\n2. 使用了现代的语法特性\n3. 注重了性能和可读性\n\n如果您想深入了解某个具体的代码片段，可以告诉我，我会详细解释。',
    
    观点: '从文章来看，作者的观点是：\n\n技术选择应该基于实际需求，而不是盲目追求新技术。作者强调了实用性和可维护性的重要性，这是一个很务实的观点。我认为这个观点在实际项目中很有参考价值。',
    
    优缺点: '让我分析一下优缺点：\n\n**优点：**\n- 提高了开发效率\n- 降低了维护成本\n- 改善了用户体验\n\n**缺点：**\n- 学习曲线较陡\n- 可能增加初期复杂度\n- 需要团队适应新的工作方式',
    
    如何: '关于如何实现，我的建议是：\n\n1. 首先理解核心概念和原理\n2. 从简单的示例开始实践\n3. 逐步应用到实际项目中\n4. 持续学习和优化\n\n记住，实践是最好的学习方式。建议您先搭建一个小型项目来熟悉相关技术。',
    
    为什么: '关于"为什么"的问题，让我解释一下：\n\n这样做的主要原因是为了解决特定的技术挑战。通过这种方式，我们可以获得更好的性能、更高的可维护性，或者更好的用户体验。文章中提到的方法是经过实践验证的，有其合理性。',
    
    性能: '关于性能方面：\n\n性能优化是一个持续的过程。文章中提到的技术/方法在性能方面有明显优势。主要体现在：\n- 减少了不必要的计算\n- 优化了资源加载\n- 改善了响应时间\n\n建议使用性能分析工具来量化优化效果。',
    
    安全: '关于安全性考虑：\n\n安全是开发中不可忽视的重要方面。在实现这个功能时，需要注意：\n- 输入验证和清理\n- 防止常见的安全漏洞（XSS、CSRF等）\n- 使用安全的依赖库\n- 定期更新和审计\n\n建议遵循 OWASP 的安全最佳实践。',
    
    测试: '关于测试策略：\n\n完善的测试是保证代码质量的关键。建议采用多层次的测试方法：\n- 单元测试：测试独立的函数和组件\n- 集成测试：测试模块间的交互\n- 端到端测试：测试完整的用户流程\n\n使用合适的测试框架，保持较高的测试覆盖率。',
  },
  default: '这是一个很好的问题。根据文章内容，我认为这个话题值得深入探讨。\n\n文章提供了有价值的见解和实践经验。如果您对某个具体方面感兴趣，可以告诉我，我会提供更详细的分析和建议。\n\n您还有其他想了解的内容吗？',
};

/**
 * 生成 Mock AI 响应
 * @param message 用户消息
 * @param _context 文章上下文（预留用于未来扩展）
 * @returns AI 响应文本
 */
export function generateMockAIResponse(message: string, _context: string): string {
  // 转换为小写以进行不区分大小写的匹配
  const lowerMessage = message.toLowerCase();
  
  // 遍历关键词，找到匹配的响应
  for (const [keyword, response] of Object.entries(mockAIResponses.keywords)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return response;
    }
  }
  
  // 如果没有匹配的关键词，返回默认响应
  return mockAIResponses.default;
}

/**
 * 模拟 AI 响应延迟
 * @param ms 延迟毫秒数
 */
export function simulateAIDelay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
