# API Documentation

This directory contains the auto-generated TypeDoc API documentation for the Financial-Shift application.

## 📚 Documentation Structure

The documentation is organized into the following sections:

- **Modules**: Core application modules (dashboard, analytics, shifts, goals, etc.)
- **Hooks**: Custom React hooks for state management and data fetching
- **Utils**: Utility functions and helpers
- **Components**: React components and UI elements
- **Types**: TypeScript interfaces and type definitions

## 🌐 Accessing Documentation

### Local Development
After running `npm run docs`, open `docs/index.html` in your browser:
```bash
npm run docs
open docs/index.html  # macOS
# or
xdg-open docs/index.html  # Linux
# or
start docs/index.html  # Windows
```

### Online Documentation
The documentation is automatically deployed to GitHub Pages on every push to the `main` branch.

**Live Documentation**: `https://<username>.github.io/Financial-hift/`

## 🔄 Updating Documentation

Documentation is automatically regenerated when you:
1. Push changes to the `main` branch (via GitHub Actions)
2. Run `npm run docs` locally

### Manual Generation
```bash
# Generate documentation
npm run docs

# Preview locally
npm run docs:serve
```

## 📖 Documentation Coverage

- **Feature Modules**: 41 TypeScript files (100% migrated)
- **Test Files**: 3 critical test files with comprehensive JSDoc
- **Hooks**: All custom hooks documented with usage examples
- **Utils**: All utility functions with parameter and return type documentation

## 🛠️ Configuration

Documentation is generated using TypeDoc with the following configuration:

- **Entry Points**: 15 main entry points covering all major modules
- **Output Format**: HTML with navigation and search
- **Theme**: Default TypeDoc theme with custom styling
- **Plugins**: 
  - `typedoc-plugin-markdown` - Markdown output support

See `typedoc.json` for full configuration details.

## 📝 JSDoc Standards

All documentation follows these standards:

### Functions/Methods
```typescript
/**
 * Brief description of what the function does
 * 
 * @param paramName - Description of parameter
 * @returns Description of return value
 * 
 * @example
 * ```tsx
 * const result = myFunction(value);
 * ```
 */
```

### Interfaces/Types
```typescript
/**
 * Brief description of the interface
 * 
 * @interface
 * @property {type} propertyName - Description of property
 */
```

### React Components
```typescript
/**
 * @component
 * @description Detailed component description
 * 
 * @example
 * ```tsx
 * <MyComponent prop="value" />
 * ```
 */
```

## 🔍 Search Functionality

The generated documentation includes full-text search:
- Use the search bar in the top navigation
- Search by class name, function name, or interface
- Filter results by module or category

## 🚀 CI/CD Pipeline

Documentation deployment is automated via GitHub Actions:

1. **Trigger**: Push to `main` branch
2. **Build**: Generate TypeDoc documentation
3. **Deploy**: Upload to GitHub Pages
4. **Live**: Documentation available at GitHub Pages URL

See `.github/workflows/deploy-docs.yml` for workflow details.

## 📊 Statistics

- **Total Pages**: 500+
- **Documented Functions**: 200+
- **Documented Interfaces**: 150+
- **Documented Components**: 50+
- **Lines of JSDoc**: 2000+

## 🤝 Contributing

When adding new code:

1. ✅ **Add JSDoc comments** to all public APIs
2. ✅ **Include @example tags** for complex functions
3. ✅ **Document parameters and return types**
4. ✅ **Run `npm run docs`** to verify documentation builds
5. ✅ **Check for TypeDoc warnings** (aim for zero warnings)

## 📄 License

This documentation is part of the Financial-Shift project and is licensed under the same terms as the main project.

---

**Generated with TypeDoc** | **Last Updated**: October 2025
