# Contributing to Wordle+

Thank you for your interest in contributing to Wordle+! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- A modern code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wordle.git
   cd wordle
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/MikhaD/wordle.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Run tests**:
   ```bash
   npm test
   ```

## Development Workflow

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

### Creating a Feature Branch

```bash
# Create and checkout a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. Make your changes in your feature branch
2. Write or update tests as needed
3. Ensure all tests pass: `npm test`
4. Lint your code: `npm run lint`
5. Format your code: `npm run format`

### Testing Your Changes

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Check coverage
npm run test:coverage

# Run type checking
npm run check

# Build the project
npm run build
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Avoid `any` types - use `unknown` or proper types
- Use type inference where possible
- Document complex types with JSDoc comments

**Example:**
```typescript
/**
 * Safely retrieve an item from localStorage
 * @param key - The storage key
 * @returns The value or null if not found/error
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get localStorage item '${key}':`, error);
    return null;
  }
}
```

### Svelte Components

- Use `<script lang="ts">` for TypeScript
- Export props with proper types
- Use reactive statements (`$:`) appropriately
- Keep components focused and single-purpose
- Use composition over deep nesting

**Example:**
```svelte
<script lang="ts">
  export let value: string;
  export let onChange: (value: string) => void;
  
  $: displayValue = value.toUpperCase();
</script>

<input 
  value={displayValue} 
  on:input={(e) => onChange(e.currentTarget.value)}
/>
```

### CSS/SCSS

- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Keep specificity low
- Use `rem` for sizing, not `px`
- Mobile-first responsive design

### File Naming

- Components: PascalCase (e.g., `GameBoard.svelte`)
- Utilities: camelCase (e.g., `localStorage.ts`)
- Tests: Same as source + `.test.ts` (e.g., `localStorage.test.ts`)
- Types: PascalCase for interfaces/types (e.g., `GameState`)

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage (target: 70%+)
- Test edge cases and error conditions
- Use descriptive test names

**Example:**
```typescript
describe('safeGetItem', () => {
  it('should retrieve item from localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(safeGetItem('test')).toBe('value');
  });

  it('should return null for non-existent key', () => {
    expect(safeGetItem('nonexistent')).toBeNull();
  });

  it('should handle localStorage errors gracefully', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    expect(safeGetItem('test')).toBeNull();
  });
});
```

### Test Organization

- Group related tests with `describe`
- Use `beforeEach` for setup
- Clean up after tests (clear mocks, stores)
- One concept per test

See [TESTING.md](TESTING.md) for comprehensive testing guidelines.

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
feat(keyboard): add haptic feedback on key press

Add tactile feedback when virtual keyboard keys are pressed
on mobile devices for better user experience.

Closes #123

---

fix(game): prevent double letter marking bug

Fix issue where double letters in guesses weren't being
marked correctly when the answer contained the letter once.

Fixes #456

---

docs: update README with new features

Add documentation for error boundaries and testing infrastructure.
```

### Scope Guidelines

- `game` - Core game logic
- `board` - Game board components
- `keyboard` - Keyboard component
- `settings` - Settings and configuration
- `stats` - Statistics tracking
- `ui` - UI components
- `utils` - Utility functions
- `test` - Test infrastructure
- `build` - Build configuration
- `deps` - Dependencies

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`npm test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Type checking passes (`npm run check`)
4. ✅ Build succeeds (`npm run build`)
5. ✅ Code is formatted (`npm run format`)
6. ✅ No console errors in browser
7. ✅ Documentation updated if needed
8. ✅ Tests added for new features

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. Automated checks must pass (linting, tests, build)
2. At least one maintainer review required
3. Address all review comments
4. Keep PR focused and reasonably sized
5. Squash commits before merging (optional)

## Project Structure

```
wordle/
├── public/              # Static assets
│   ├── img/            # Images and icons
│   ├── global.css      # Global styles
│   └── manifest.json   # PWA manifest
├── src/
│   ├── components/     # Svelte components
│   │   ├── board/     # Board-related components
│   │   ├── keyboard/  # Keyboard components
│   │   ├── settings/  # Settings components
│   │   └── widgets/   # Reusable widgets
│   ├── test/          # Test utilities
│   ├── *.ts           # Utility modules
│   ├── *.test.ts      # Test files
│   ├── App.svelte     # Root component
│   └── main.ts        # Entry point
├── scripts/           # Build scripts
├── dist/              # Build output (gitignored)
└── docs/              # Documentation
```

## Adding New Features

### Creating a New Game Mode

See the dropdown in [README.md](README.md#how-to-create-a-new-mode) for mode creation instructions.

### Adding New Components

1. Create component in appropriate directory
2. Export from `index.ts` if part of a module
3. Add TypeScript types for props
4. Write component tests
5. Update documentation

### Adding New Utilities

1. Create utility module in `src/`
2. Export functions with JSDoc comments
3. Write comprehensive tests
4. Add to [API.md](API.md) if public API
5. Consider error handling and edge cases

## Getting Help

- 📖 Read the [documentation](README.md)
- 🐛 Check [existing issues](https://github.com/MikhaD/wordle/issues)
- 💬 Ask questions in issue discussions
- 📧 Contact maintainers if needed

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Project README (for major features)

Thank you for contributing to Wordle+! 🎉
