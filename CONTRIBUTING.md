# Contributing to Groove

Thank you for your interest in contributing to Groove! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. For backend development: `cd backend && pnpm install`
4. Start development server: `pnpm dev`

## Code Quality Requirements

### Before Submitting a PR

Run the following checks locally:

```bash
# Extension
pnpm validate    # TypeScript + ESLint + Prettier
pnpm test        # Run tests

# Backend
cd backend
pnpm typecheck   # TypeScript check
pnpm test        # Run tests
```

### CI Pipeline

All PRs trigger the following checks:

| Job | Description | Must Pass |
|-----|-------------|-----------|
| **Lint & Typecheck** | ESLint + TypeScript for extension and backend | Yes |
| **Backend Tests** | 113 tests covering services, routes, utilities | Yes |
| **Frontend Tests** | 124 tests covering services, hooks, components | Yes |
| **Build** | Extension + backend production build | Yes |

## Branch Protection Rules (Recommended)

For repository maintainers, configure these branch protection rules on `main`:

### GitHub Settings > Branches > Add Rule

**Branch name pattern:** `main`

#### Protect matching branches:

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if CODEOWNERS file exists)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks:
    - `Lint & Typecheck`
    - `Backend Tests`
    - `Frontend Tests`
    - `Build`

- [x] **Require conversation resolution before merging**

- [x] **Do not allow bypassing the above settings**

#### Rules applied to everyone including administrators:

- [ ] Allow force pushes (disabled)
- [ ] Allow deletions (disabled)

### Setting Up via GitHub CLI

```bash
gh api repos/{owner}/{repo}/branches/main/protection -X PUT \
  -F required_status_checks='{"strict":true,"checks":[{"context":"Lint & Typecheck"},{"context":"Backend Tests"},{"context":"Frontend Tests"},{"context":"Build"}]}' \
  -F enforce_admins=true \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":false,"required_approving_review_count":1}' \
  -F restrictions=null
```

## Testing Guidelines

### Test Structure

```
src/tests/
├── services/           # Service tests
├── hooks/              # React hook tests  
├── components/         # React component tests
├── mocks/              # MSW handlers, test utilities
└── setup.ts            # Test setup (Chrome API mocks, etc.)

backend/src/tests/
├── services/           # Service tests
├── routes/             # Integration tests
├── utils/              # Utility tests
├── helpers/            # Test utilities
└── setup.ts            # Test setup (MongoDB Memory Server, etc.)
```

### Writing Tests

- Use descriptive test names: `it("should return error when user not found")`
- Group related tests with `describe` blocks
- Use factories for creating test data
- Mock external dependencies (Chrome APIs, databases, etc.)

### Running Tests

```bash
# Run all frontend tests
pnpm test

# Run specific test file
pnpm test -- src/tests/hooks/useQueue.test.ts

# Run with coverage
pnpm test -- --coverage

# Backend tests
cd backend && pnpm test
```

## Commit Guidelines

- Use conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Keep commits atomic and focused
- Reference issues when applicable: `fix(auth): resolve token refresh (#123)`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run local checks (`pnpm validate && pnpm test`)
4. Push and create a PR
5. Wait for CI checks to pass
6. Request review from maintainers
7. Address feedback
8. Merge when approved and all checks pass

## Code Style

- TypeScript strict mode enabled
- No `any` types allowed
- Use `import type` for type-only imports
- Follow existing patterns in the codebase
- Format with Prettier before committing
