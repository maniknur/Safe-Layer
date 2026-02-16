# Contributing to SafeLayer BNB

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/safelayer-bnb.git`
3. **Create a branch**: `git checkout -b feature/my-feature`
4. **Follow** the [DEVELOPMENT.md](DEVELOPMENT.md) guide for setup

## Development Workflow

### 1. Set Up Environment

```bash
docker-compose up
```

Or manually:
```bash
bash setup.sh
```

### 2. Make Changes

- Follow the code style (see below)
- Add tests for new features
- Update documentation

### 3. Test Locally

```bash
# Backend tests
cd backend
npm test

# Build frontend
cd frontend
npm run build
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: add new risk factor"
git push origin feature/my-feature
```

### 5. Create Pull Request

Create a PR with:
- Clear description of changes
- Link to any related issues
- List of testing done

## Code Style

### TypeScript
- Use strict mode
- Add types (no `any`)
- Add JSDoc comments

### File Structure
```
backend/
├── src/
│   ├── modules/        # Feature modules
│   ├── routes/         # API routes
│   ├── utils/          # Utilities
│   └── __tests__/      # Tests
```

### Naming Conventions
- Files: `camelCase.ts`
- Functions/Classes: `PascalCase` (classes), `camelCase` (functions)
- Constants: `UPPER_SNAKE_CASE`
- Variables: `camelCase`

### Example Function

```typescript
/**
 * Analyze wallet risk based on transaction history
 * @param address - Ethereum wallet address
 * @returns Risk score (0-100)
 * @throws Error if address is invalid
 */
export async function analyzeWallet(address: string): Promise<number> {
  logger.info(`Analyzing wallet: ${address}`);
  
  // Implementation
  const score = calculateScore(/* ... */);
  
  logger.debug(`Wallet risk: ${score}`);
  return score;
}
```

## Testing Requirements

- All new features must have tests
- Tests must pass: `npm test`
- Aim for >80% coverage

### Test Example

```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Documentation

Update docs when:
- Adding new API endpoints → Update [API.md](API.md)
- Adding new modules → Update [DEVELOPMENT.md](DEVELOPMENT.md)
- Changing setup → Update [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)

## Commit Message Format

```
type(scope): subject

- Detailed explanation (optional)

Fixes #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance
- `refactor`: Code refactoring
- `perf`: Performance improvement

Examples:
```
feat(scanner): add reentrancy detection
fix(aggregator): correct weight calculation
docs(api): update endpoint documentation
test(wallet): add unit tests for transaction analysis
```

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No breaking changes (or documented)

## Issues & Bug Reports

If you find a bug:

1. **Check** if it's already reported
2. **Create** an issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (Node version, OS, etc)

Example:
```
Title: Risk score returns NaN for addresses without history

Steps:
1. Enter address 0x0000000000000000000000000000000000000000
2. Click analyze

Expected: Risk score between 0-100
Actual: Returns NaN

Environment: Node 18.12.0, macOS 13.1
```

## Feature Requests

Have an idea? Create an issue with:
- Clear description of the feature
- Why it's useful
- How it would work

Example:
```
Title: Add batch risk analysis endpoint

Use case: Analyze multiple addresses in one request
Proposal: POST /api/risk/batch with array of addresses
```

## Code Review

- Reviews are constructive feedback
- Questions are not criticism
- All suggestions should be addressed or discussed

## Areas for Contribution

### High Priority
- [ ] Real blockchain integration (replace mock data)
- [ ] Database persistence
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Test coverage

### Medium Priority
- [ ] Frontend UI/UX improvements
- [ ] Additional risk factors
- [ ] API documentation
- [ ] Logging improvements
- [ ] Configuration options

### Low Priority
- [ ] Refactoring code for clarity
- [ ] Adding comments
- [ ] Updating dependencies
- [ ] Minor bug fixes

## Getting Help

- Read [DEVELOPMENT.md](DEVELOPMENT.md) for technical details
- Check existing code in `/modules` for examples
- Open an issue with questions
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing to SafeLayer BNB! 🚀
