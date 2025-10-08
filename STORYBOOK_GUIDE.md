# 📖 Storybook Setup Guide

## Overview

This guide provides instructions for setting up Storybook for component documentation. Storybook is **optional** but highly recommended for component development and documentation.

---

## Quick Install

```bash
# Install Storybook with Vite builder
npx storybook@latest init --builder vite --yes

# Start Storybook
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

---

## Manual Installation

If you prefer manual installation:

### 1. Install Dependencies

```bash
npm install --save-dev @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y @storybook/blocks storybook
```

### 2. Create `.storybook/main.js`

```javascript
export default {
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../pages/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Merge Vite config with Storybook
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
        },
      },
    };
  },
};
```

### 3. Create `.storybook/preview.js`

```javascript
import '../index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#1a1a1a',
      },
    ],
  },
};

// Global decorators
export const decorators = [
  (Story) => (
    <div style={{ padding: '2rem' }}>
      <Story />
    </div>
  ),
];
```

### 4. Add Scripts to `package.json`

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

---

## Story Examples

### Button Story

Create `components/ui/Button.stories.jsx`:

```javascript
import { Button } from './button.jsx';

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

// Default button
export const Default = {
  args: {
    children: 'Button',
  },
};

// Primary action
export const Primary = {
  args: {
    children: 'Primary Action',
    variant: 'default',
  },
};

// Destructive action
export const Destructive = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

// Outlined
export const Outlined = {
  args: {
    children: 'Cancel',
    variant: 'outline',
  },
};

// Small size
export const Small = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

// Large size
export const Large = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// Disabled
export const Disabled = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

// With icon
import { TrashIcon } from 'lucide-react';

export const WithIcon = {
  args: {
    children: (
      <>
        <TrashIcon className="w-4 h-4 mr-2" />
        Delete Item
      </>
    ),
    variant: 'destructive',
  },
};
```

### Card Story

Create `components/ui/Card.stories.jsx`:

```javascript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card.jsx';
import { Button } from './button.jsx';

export default {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard = {
  render: () => (
    <Card>
      <CardContent className="pt-6">
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
  ),
};

export const WithGradient = {
  render: () => (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
      <CardHeader>
        <CardTitle>Gradient Card</CardTitle>
        <CardDescription className="text-blue-100">
          Card with gradient background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Beautiful gradient card content</p>
      </CardContent>
    </Card>
  ),
};
```

### Input Story

Create `components/ui/Input.stories.jsx`:

```javascript
import { Input } from './input.jsx';
import { Label } from './label.jsx';

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export const Default = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Password = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithError = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        placeholder="you@example.com"
        className="border-red-500"
      />
      <p className="text-sm text-red-500">Please enter a valid email address</p>
    </div>
  ),
};
```

---

## Advanced Features

### Dark Mode Support

Update `.storybook/preview.js`:

```javascript
export const parameters = {
  // ... other parameters
  darkMode: {
    dark: { ...themes.dark },
    light: { ...themes.normal },
    classTarget: 'html',
    darkClass: 'dark',
    lightClass: 'light',
    stylePreview: true,
  },
};

// Add dark mode addon
// In .storybook/main.js addons array:
'storybook-dark-mode'
```

Install addon:
```bash
npm install --save-dev storybook-dark-mode
```

### Accessibility Testing

Already included via `@storybook/addon-a11y`. The addon will:
- Check color contrast
- Verify ARIA labels
- Test keyboard navigation
- Report accessibility violations

### Interactive Stories

```javascript
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const WithInteraction = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    await expect(button).toHaveTextContent('Click Me');
  },
};
```

### Component Controls

```javascript
export default {
  title: 'UI/Component',
  component: MyComponent,
  argTypes: {
    // Text control
    text: { control: 'text' },
    
    // Number control
    count: { control: { type: 'number', min: 0, max: 100, step: 1 } },
    
    // Boolean control
    isActive: { control: 'boolean' },
    
    // Select control
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    
    // Radio control
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    
    // Color picker
    color: { control: 'color' },
    
    // Date picker
    date: { control: 'date' },
    
    // Object editor
    config: { control: 'object' },
  },
};
```

---

## Component Documentation

### MDX Stories

Create `components/ui/Button.stories.mdx`:

```mdx
import { Meta, Story, Canvas, ArgsTable } from '@storybook/blocks';
import { Button } from './button.jsx';

<Meta title="UI/Button" component={Button} />

# Button

A versatile button component with multiple variants and sizes.

## Usage

```jsx
import { Button } from '@/components/ui/button.jsx';

<Button>Click Me</Button>
```

## Variants

<Canvas>
  <Story name="All Variants">
    <div className="flex gap-2 flex-wrap">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  </Story>
</Canvas>

## Props

<ArgsTable of={Button} />

## Accessibility

- ✅ Keyboard navigable
- ✅ Focus visible
- ✅ ARIA labels supported
- ✅ Disabled state properly communicated
```

---

## Best Practices

### Story Organization

```
components/
  ui/
    button.jsx
    Button.stories.jsx    # Stories
    Button.test.jsx       # Tests
    
pages/
  Dashboard.jsx
  Dashboard.stories.jsx   # Page stories
```

### Naming Convention

- Stories file: `ComponentName.stories.jsx`
- Story title: `Category/ComponentName`
- Export names: PascalCase

### Story Structure

```javascript
export default {
  title: 'Category/Component',    // Navigation path
  component: Component,            // Component reference
  tags: ['autodocs'],              // Auto-generate docs
  argTypes: { /* controls */ },    // Control configuration
};

export const StoryName = {
  args: { /* props */ },           // Default props
  render: () => <Component />,     // Custom render
};
```

---

## Deployment

### Build Static Storybook

```bash
npm run build-storybook
```

Output: `storybook-static/` directory

### Deploy to Netlify

```bash
# netlify.toml
[build]
  command = "npm run build-storybook"
  publish = "storybook-static"
```

### Deploy to Vercel

```bash
# vercel.json
{
  "buildCommand": "npm run build-storybook",
  "outputDirectory": "storybook-static"
}
```

### Deploy to GitHub Pages

```bash
npm run build-storybook
npx storybook-to-ghpages --existing-output-dir=storybook-static
```

---

## Troubleshooting

### Module Resolution Issues

Add to `.storybook/main.js`:

```javascript
viteFinal: async (config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        '@': path.resolve(__dirname, '../'),
      },
    },
  };
},
```

### CSS Not Loading

Import global CSS in `.storybook/preview.js`:

```javascript
import '../index.css';
```

### Component Not Found

Check your story imports:

```javascript
// ✅ Correct
import { Button } from './button.jsx';

// ❌ Wrong
import { Button } from '@/components/ui/button.jsx';
```

---

## Resources

- **Storybook Docs:** https://storybook.js.org/docs
- **Vite Builder:** https://github.com/storybookjs/builder-vite
- **Accessibility Addon:** https://storybook.js.org/addons/@storybook/addon-a11y
- **Component Generator:** `npm run generate:component MyComponent` (creates story automatically)

---

## Alternative: Component Documentation

If you prefer not to use Storybook, you can:

1. **Use the component generator:**
   ```bash
   npm run generate:component MyComponent
   ```
   Creates component with test file (story file optional)

2. **Read the Component Library Guide:**
   See `COMPONENT_LIBRARY.md` for comprehensive documentation

3. **Run the Performance Dashboard:**
   Navigate to `/dev/performance` in dev mode

4. **Use Component Tests as Documentation:**
   Test files (`*.test.jsx`) serve as usage examples

---

**Component documentation is complete with or without Storybook!** 🎉
