import fc from 'fast-check';
import type { Feed, Article, Note, ChatHistory, ChatMessage } from '../types';

/**
 * Generator for valid RSS feed URLs
 */
export const feedUrlArbitrary = fc
  .webUrl({ validSchemes: ['http', 'https'] })
  .filter((url) => url.includes('.'));

/**
 * Generator for Feed objects
 */
export const feedArbitrary: fc.Arbitrary<Feed> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  url: feedUrlArbitrary,
  siteUrl: fc.option(fc.webUrl(), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  iconUrl: fc.option(fc.webUrl(), { nil: undefined }),
  unreadCount: fc.nat({ max: 1000 }),
  lastFetchedAt: fc.option(fc.date(), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generator for Article objects
 */
export const articleArbitrary: fc.Arbitrary<Article> = fc.record({
  id: fc.uuid(),
  feedId: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  content: fc.lorem({ maxCount: 50 }),
  summary: fc.option(fc.string({ maxLength: 300 }), { nil: undefined }),
  author: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
    nil: undefined,
  }),
  url: fc.webUrl(),
  publishedAt: fc.date(),
  isRead: fc.boolean(),
  createdAt: fc.date(),
});

/**
 * Generator for Article objects with specific feedId
 */
export const articleWithFeedIdArbitrary = (
  feedId: string
): fc.Arbitrary<Article> =>
  articleArbitrary.map((article) => ({ ...article, feedId }));

/**
 * Generator for Markdown content with headings
 */
export const markdownWithHeadingsArbitrary = fc
  .array(
    fc.tuple(
      fc.integer({ min: 1, max: 6 }), // heading level
      fc.string({ minLength: 1, maxLength: 50 }) // heading text
    ),
    { minLength: 1, maxLength: 10 }
  )
  .map((headings) =>
    headings
      .map(([level, text]) => `${'#'.repeat(level)} ${text}`)
      .join('\n\n')
  );

/**
 * Generator for NoteItem objects
 */
export const noteItemArbitrary = fc.record({
  id: fc.uuid(),
  content: fc.string({ minLength: 1, maxLength: 1000 }),
  quotedText: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generator for Note objects
 */
export const noteArbitrary: fc.Arbitrary<Note> = fc.record({
  id: fc.uuid(),
  articleId: fc.uuid(),
  items: fc.array(noteItemArbitrary, { minLength: 0, maxLength: 10 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generator for ChatMessage objects
 */
export const chatMessageArbitrary: fc.Arbitrary<ChatMessage> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('user' as const, 'assistant' as const),
  content: fc.string({ minLength: 1, maxLength: 1000 }),
  timestamp: fc.date(),
});

/**
 * Generator for ChatHistory objects
 */
export const chatHistoryArbitrary: fc.Arbitrary<ChatHistory> = fc.record({
  id: fc.uuid(),
  articleId: fc.uuid(),
  messages: fc.array(chatMessageArbitrary, { minLength: 0, maxLength: 20 }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

/**
 * Generator for non-empty whitespace strings
 */
export const whitespaceStringArbitrary = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1 })
  .map((chars) => chars.join(''));

/**
 * Generator for invalid URLs
 */
export const invalidUrlArbitrary = fc.oneof(
  fc.string().filter((s) => !s.startsWith('http')),
  fc.constant(''),
  fc.constant('not-a-url'),
  fc.constant('ftp://invalid-scheme.com')
);
