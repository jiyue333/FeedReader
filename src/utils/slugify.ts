/**
 * Heading slug 生成工具
 * 
 * 用于生成唯一的标题 ID，避免重复
 */

/**
 * 将文本转换为 URL 友好的 slug
 * @param text 原始文本
 * @returns slug 字符串
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 保留中文、英文、数字
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    // 移除首尾的连字符
    .replace(/^-+|-+$/g, '');
}

/**
 * 生成唯一的 slug，处理重复情况
 * @param text 原始文本
 * @param existingSlugs 已存在的 slug 集合
 * @returns 唯一的 slug
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: Set<string>
): string {
  const baseSlug = slugify(text);
  
  // 如果 slug 为空，使用默认值
  if (!baseSlug) {
    let counter = 1;
    let slug = `heading-${counter}`;
    while (existingSlugs.has(slug)) {
      counter++;
      slug = `heading-${counter}`;
    }
    return slug;
  }

  // 如果 slug 不重复，直接返回
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // 如果重复，添加数字后缀
  let counter = 1;
  let slug = `${baseSlug}-${counter}`;
  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}
