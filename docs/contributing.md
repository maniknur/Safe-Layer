# Contributing to SafeLayer

## Getting Started

1. Fork the repository
2. Clone: `git clone https://github.com/your-username/safelayer-bnb.git`
3. Create a branch: `git checkout -b feature/my-feature`
4. Install dependencies: `npm install --workspaces`

## Development

```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

## Code Style

- TypeScript strict mode, avoid `any`
- Files: `camelCase.ts` / Components: `PascalCase.tsx`
- Constants: `UPPER_SNAKE_CASE`

## Commit Messages

```
type(scope): subject

feat(scanner): add reentrancy detection
fix(engine): correct weight calculation
docs(api): update endpoint docs
```

Types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`

## Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Documentation updated if needed
- [ ] No secrets committed

## License

By contributing, you agree your work is licensed under MIT.
