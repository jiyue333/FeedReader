import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  feedArbitrary,
  articleArbitrary,
  markdownWithHeadingsArbitrary,
} from './generators';

describe('Test Framework Setup', () => {
  it('should run basic unit tests', () => {
    expect(true).toBe(true);
  });

  it('should support property-based testing with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  it('should generate valid Feed objects', () => {
    fc.assert(
      fc.property(feedArbitrary, (feed) => {
        expect(feed).toHaveProperty('id');
        expect(feed).toHaveProperty('title');
        expect(feed).toHaveProperty('url');
        expect(feed.title.length).toBeGreaterThan(0);
        expect(feed.unreadCount).toBeGreaterThanOrEqual(0);
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should generate valid Article objects', () => {
    fc.assert(
      fc.property(articleArbitrary, (article) => {
        expect(article).toHaveProperty('id');
        expect(article).toHaveProperty('feedId');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('content');
        expect(article.title.length).toBeGreaterThan(0);
        expect(typeof article.isRead).toBe('boolean');
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('should generate markdown with headings', () => {
    fc.assert(
      fc.property(markdownWithHeadingsArbitrary, (markdown) => {
        expect(markdown).toContain('#');
        expect(markdown.length).toBeGreaterThan(0);
        return true;
      }),
      { numRuns: 10 }
    );
  });
});
