# Testing Setup

This directory contains the testing infrastructure for the RSS Reader application.

## Testing Stack

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Testing utilities for React components
- **fast-check**: Property-based testing library for generating test cases
- **@testing-library/jest-dom**: Custom matchers for DOM assertions

## Directory Structure

```
src/test/
├── setup.ts          # Test environment setup and global mocks
├── utils.tsx         # Test utility functions
├── generators.ts     # Property-based testing generators
├── setup.test.ts     # Setup verification tests
└── README.md         # This file
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Utilities

### Component Testing

Use `renderWithRouter` to render components that use React Router:

```typescript
import { renderWithRouter } from '@/test/utils';

test('renders component', () => {
  const { getByText } = renderWithRouter(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
});
```

### Property-Based Testing

Use generators from `generators.ts` for property-based tests:

```typescript
import fc from 'fast-check';
import { feedArbitrary, articleArbitrary } from '@/test/generators';

/**
 * Feature: rss-reader-frontend, Property 1: Example property
 */
test('property test example', () => {
  fc.assert(
    fc.property(feedArbitrary, (feed) => {
      // Test logic here
      expect(feed.unreadCount).toBeGreaterThanOrEqual(0);
      return true;
    }),
    { numRuns: 100 }
  );
});
```

## Available Generators

- `feedArbitrary`: Generates random Feed objects
- `articleArbitrary`: Generates random Article objects
- `articleWithFeedIdArbitrary(feedId)`: Generates articles for a specific feed
- `markdownWithHeadingsArbitrary`: Generates markdown with headings
- `noteArbitrary`: Generates random Note objects
- `chatMessageArbitrary`: Generates random ChatMessage objects
- `chatHistoryArbitrary`: Generates random ChatHistory objects
- `whitespaceStringArbitrary`: Generates whitespace-only strings
- `invalidUrlArbitrary`: Generates invalid URL strings

## Test Annotations

All property-based tests must include a comment linking to the design document:

```typescript
/**
 * Feature: rss-reader-frontend, Property X: Property name
 */
```

## Configuration

- `vitest.config.ts`: Main Vitest configuration
- `src/test/setup.ts`: Global test setup (runs before each test file)
- `tsconfig.test.json`: TypeScript configuration for tests

## Mocks

The setup file includes mocks for:
- `localStorage`: In-memory storage for testing
- `IntersectionObserver`: For components using intersection observers
- `scrollIntoView`: For scroll-related functionality

## Best Practices

1. **Property-based tests**: Run at least 100 iterations (`numRuns: 100`)
2. **Test naming**: Use descriptive names that explain what is being tested
3. **Annotations**: Always annotate property tests with the corresponding design property
4. **Minimal tests**: Focus on core functionality, avoid over-testing edge cases
5. **Real data**: Don't use mocks to make tests pass - validate real functionality
