# Contributing to KODEX

Thank you for your interest in contributing to KODEX! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** provided
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information
   - Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check the roadmap** to see if it's already planned
2. **Open a feature request** with detailed description
3. **Explain the use case** and benefits
4. **Consider implementation complexity**

### Code Contributions

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/kodex.git
   cd kodex
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes**
3. **Test thoroughly**
4. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

```typescript
// Good
interface DocumentFile {
  id: string;
  name: string;
  content: string;
  lastModified: string;
}

// Avoid
const data: any = {};
```

### React Components

- Use functional components with hooks
- Implement proper prop types
- Use meaningful component names
- Keep components focused and small

```tsx
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use consistent spacing (8px grid system)
- Implement proper dark mode support

```tsx
// Good
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
    Title
  </h2>
</div>
```

### File Organization

- Keep components in `src/components/`
- Use descriptive file names
- Group related components in subdirectories
- Export components properly

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Modal.tsx
│   ├── features/        # Feature-specific components
│   │   ├── VersionControl/
│   │   └── AIGenerator/
│   └── layout/          # Layout components
│       ├── Header.tsx
│       └── Sidebar.tsx
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Test edge cases and error conditions
- Use descriptive test names
- Mock external dependencies

```typescript
// Good test example
describe('DocumentEditor', () => {
  it('should save content when save button is clicked', async () => {
    const mockOnSave = jest.fn();
    render(<DocumentEditor onSave={mockOnSave} />);
    
    const editor = screen.getByRole('textbox');
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(editor, { target: { value: 'New content' } });
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith('New content');
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props and interfaces
- Include usage examples where helpful

```typescript
/**
 * Renders a markdown file with syntax highlighting
 * @param content - The markdown content to render
 * @param className - Additional CSS classes to apply
 * @returns Rendered markdown component
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Implementation
}
```

### README Updates

- Update README for new features
- Include code examples
- Update installation instructions if needed
- Add screenshots for UI changes

## 🚀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Dark mode support implemented

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on different browsers/devices
4. **Approval** from at least one maintainer
5. **Merge** after all checks pass

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## 🏷️ Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat: add AI markdown generation
fix: resolve authentication state persistence
docs: update installation instructions
style: improve responsive design on mobile
refactor: extract reusable button component
test: add unit tests for diff viewer
chore: update dependencies
```

## 🔄 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

1. **Feature freeze** for release
2. **Testing** and bug fixes
3. **Documentation** updates
4. **Version bump** and changelog
5. **Release** and deployment

## 🌟 Recognition

Contributors are recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **GitHub releases** notes
- **Social media** shoutouts

## 📞 Getting Help

If you need help contributing:

- 💬 **Discord**: [Join our community](https://discord.gg/kodex)
- 📧 **Email**: contributors@kodex.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/kodex/issues)
- 📖 **Docs**: [Contributing Guide](https://kodex.netlify.app/contributing)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@kodex.dev. All complaints will be reviewed and investigated promptly and fairly.

---

Thank you for contributing to KODEX! 🚀