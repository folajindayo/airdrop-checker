/**
 * Quality Configuration
 * Code quality standards and enforcement rules
 */

export const QUALITY_STANDARDS = {
  // File size limits
  maxFileLines: 500,
  targetFileLines: 300,
  warnFileLines: 400,

  // Function complexity
  maxComplexity: 10,
  maxParameters: 5,
  maxNestingDepth: 4,

  // Code coverage targets
  minCoverage: 80,
  targetCoverage: 90,

  // Performance budgets
  maxBundleSize: 500 * 1024, // 500KB
  maxInitialLoad: 3000, // 3 seconds
  maxAPIResponse: 1000, // 1 second

  // Naming conventions
  namingRules: {
    components: 'PascalCase',
    hooks: 'camelCase with use prefix',
    utils: 'camelCase',
    constants: 'UPPER_SNAKE_CASE',
  },
};

export const LINTING_RULES = {
  'no-console': 'warn',
  'no-unused-vars': 'error',
  'no-debugger': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
};

export const CODE_REVIEW_CHECKLIST = [
  'Code follows naming conventions',
  'Functions are well-documented',
  'Tests are included',
  'No console.logs in production code',
  'Error handling is implemented',
  'Performance considerations addressed',
  'Accessibility requirements met',
  'Security best practices followed',
];

