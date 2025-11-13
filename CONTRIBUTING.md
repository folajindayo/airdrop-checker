# Contributing to Airdrop Finder

Thank you for your interest in contributing to Airdrop Finder! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/airdrop-checker.git
   cd airdrop-checker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create `.env.local` in `apps/web/`:
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   GOLDRUSH_API_KEY=your_goldrush_api_key
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Database Setup**
   ```bash
   cd apps/web
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   cd ../..
   npm run dev
   ```

## Project Structure

```
airdrop-checker/
├── apps/
│   └── web/                 # Next.js application
│       ├── app/             # App Router pages and API routes
│       ├── components/      # React components
│       ├── lib/             # Business logic, services, utilities
│       └── __tests__/       # Test files
└── packages/
    └── shared/              # Shared code across packages
        ├── constants/       # Shared constants
        ├── types/           # TypeScript types
        └── utils/           # Utility functions
```

## Coding Standards

### File Organization

- **File Length**: Aim for 200-400 lines per file
- **Maximum**: Never exceed 800-1000 lines (except config/generated files)
- **Break Down**: Split large files into smaller, focused modules

### TypeScript

- **Strict Mode**: All code must pass TypeScript strict mode checks
- **Type Safety**: No `any` types without explicit justification
- **Return Types**: Always specify return types for functions
- **Imports**: Use type imports where possible: `import type { Type } from './types'`

### React Components

- **Styling**: Use NativeWind/TailwindCSS (NO StyleSheet)
- **Naming**: PascalCase for components, camelCase for files
- **Props**: Define explicit prop types with TypeScript interfaces
- **Hooks**: Extract complex logic into custom hooks

### Code Style

We use ESLint and Prettier to enforce consistent code style:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

Pre-commit hooks will automatically format and lint your code.

## Testing Guidelines

### Test Coverage

- Aim for 80%+ test coverage
- All new features must include tests
- Bug fixes should include regression tests

### Test Types

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API routes with real dependencies
3. **E2E Tests**: Test critical user flows

### Writing Tests

```typescript
describe('Feature Name', () => {
  describe('Specific Behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **perf**: Performance improvements
- **chore**: Maintenance tasks

### Examples

```bash
feat(api): add wallet comparison endpoint

Adds new endpoint to compare multiple wallet addresses
and return comparative analytics.

Closes #123

fix(ui): resolve mobile navigation overflow issue

test(services): add comprehensive tests for airdrop service
```

### Commit Size

- **Small**: Single file, focused change
- **Medium**: Feature component, utility module
- **Large**: Split into multiple commits

## Pull Request Process

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Locally**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all CI checks pass

### PR Checklist

- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] No merge conflicts

## Documentation

### Code Documentation

- **JSDoc**: Add JSDoc comments for all public APIs
- **Inline Comments**: Explain complex logic
- **README**: Update README for new features

### JSDoc Example

```typescript
/**
 * Check airdrop eligibility for a wallet address
 * 
 * @param address - Ethereum wallet address to check
 * @param options - Optional configuration
 * @returns Promise resolving to eligibility result
 * 
 * @example
 * ```typescript
 * const result = await checkEligibility('0x...');
 * console.log(result.overallScore);
 * ```
 */
export async function checkEligibility(
  address: string,
  options?: CheckOptions
): Promise<EligibilityResult> {
  // Implementation
}
```

### API Documentation

- Document all API endpoints
- Include request/response examples
- Specify query parameters and headers
- Document error responses

## Development Workflow

### Daily Development

1. Pull latest changes
   ```bash
   git pull origin main
   ```

2. Create feature branch
   ```bash
   git checkout -b feature/name
   ```

3. Make changes iteratively
   - Write code
   - Write tests
   - Run tests locally
   - Commit frequently

4. Keep branch updated
   ```bash
   git fetch origin
   git rebase origin/main
   ```

5. Push and create PR

### Code Review

- Be respectful and constructive
- Explain the "why" behind suggestions
- Respond to feedback promptly
- Request changes when necessary

## Common Tasks

### Adding a New API Route

1. Create route file in `apps/web/app/api/`
2. Implement handler with error handling
3. Add validation using Zod schemas
4. Create service in `apps/web/lib/services/`
5. Write comprehensive tests
6. Update API documentation

### Adding a New Component

1. Create component file in `apps/web/components/`
2. Define prop types with TypeScript
3. Use TailwindCSS for styling
4. Add accessibility attributes
5. Write component tests
6. Update Storybook (if applicable)

### Adding a New Utility

1. Create utility file in appropriate directory
2. Add comprehensive JSDoc comments
3. Export from index file
4. Write unit tests
5. Update type definitions

## Getting Help

- **Issues**: Check existing issues or create new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (if available)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Testing Library](https://testing-library.com/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to Airdrop Finder! 🎉

