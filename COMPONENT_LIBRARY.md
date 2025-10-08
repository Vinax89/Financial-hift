# 📚 Component Library Documentation

## Overview

Financial $hift uses a component-driven architecture built on **Radix UI** primitives and styled with **Tailwind CSS**. This document provides comprehensive guidance for using and extending the component library.

---

## Design System

### Colors

Our color system is built on semantic tokens for consistent theming:

```css
/* Primary Colors */
--primary: 222.2 47.4% 11.2%
--primary-foreground: 210 40% 98%

/* Secondary Colors */
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%

/* Accent Colors */
--accent: 210 40% 96.1%
--accent-foreground: 222.2 47.4% 11.2%

/* Status Colors */
--destructive: 0 84.2% 60.2%
--success: 142 76% 36%
--warning: 38 92% 50%
--info: 199 89% 48%

/* Neutral Colors */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--muted: 210 40% 96.1%
--muted-foreground: 215.4 16.3% 46.9%
```

### Spacing

Following Tailwind's spacing scale (0.25rem = 1 unit):

- `xs`: 0.5rem (2 units)
- `sm`: 0.75rem (3 units)
- `md`: 1rem (4 units)
- `lg`: 1.5rem (6 units)
- `xl`: 2rem (8 units)
- `2xl`: 3rem (12 units)

### Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, system-ui, sans-serif

/* Font Sizes */
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)

/* Font Weights */
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### Border Radius

```css
rounded-none: 0
rounded-sm: 0.125rem
rounded: 0.25rem
rounded-md: 0.375rem
rounded-lg: 0.5rem
rounded-xl: 0.75rem
rounded-2xl: 1rem
rounded-full: 9999px
```

---

## Core Components

### Button

A versatile button component with multiple variants and sizes.

**Import:**
```javascript
import { Button } from '@/components/ui/button.jsx';
```

**Props:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**
```javascript
// Primary button
<Button>Click Me</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Outlined style
<Button variant="outline">Cancel</Button>

// Small size
<Button size="sm">Small Button</Button>

// Icon button
<Button size="icon">
  <TrashIcon className="w-4 h-4" />
</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With loading state
<Button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

**Accessibility:**
- ✅ Keyboard navigable (Tab, Enter, Space)
- ✅ Focus visible styling
- ✅ Disabled state properly communicated
- ✅ ARIA labels supported

---

### Card

Container component for grouping related content.

**Import:**
```javascript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card.jsx';
```

**Props:**
```typescript
interface CardProps {
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```javascript
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variants:**
```javascript
// Clickable card
<Card className="cursor-pointer hover:bg-accent transition-colors">
  <CardContent>Clickable content</CardContent>
</Card>

// Card with gradient
<Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
  <CardContent>Gradient card</CardContent>
</Card>
```

---

### Input

Form input component with validation support.

**Import:**
```javascript
import { Input } from '@/components/ui/input.jsx';
```

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Usage:**
```javascript
// Basic input
<Input placeholder="Enter text" />

// With label
<div>
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// With error state
<div>
  <Input
    type="email"
    placeholder="Email"
    className={error ? 'border-red-500' : ''}
  />
  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
</div>

// Disabled
<Input disabled placeholder="Disabled input" />
```

**Accessibility:**
- ✅ Label association with `htmlFor`
- ✅ Error messages with `aria-describedby`
- ✅ Placeholder text for guidance
- ✅ Disabled state properly communicated

---

### Select

Dropdown select component built on Radix UI.

**Import:**
```javascript
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select.jsx';
```

**Usage:**
```javascript
<Select onValueChange={(value) => console.log(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

**With Groups:**
```javascript
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="broccoli">Broccoli</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

---

### Dialog (Modal)

Modal dialog component for overlays and confirmations.

**Import:**
```javascript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
```

**Usage:**
```javascript
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description or instructions go here.
      </DialogDescription>
    </DialogHeader>
    <div>
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Controlled Dialog:**
```javascript
const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Controlled Dialog</DialogTitle>
    </DialogHeader>
    <Button onClick={() => setOpen(false)}>Close</Button>
  </DialogContent>
</Dialog>
```

**Accessibility:**
- ✅ Focus trap within modal
- ✅ ESC key to close
- ✅ Click outside to close
- ✅ Focus returns to trigger on close
- ✅ ARIA roles and labels

---

### Toast (Notifications)

Toast notification system for user feedback.

**Import:**
```javascript
import { useToast } from '@/hooks/use-toast.js';
import { Toaster } from '@/ui/toaster.jsx';
```

**Setup:**
```javascript
// Add to App.jsx (already included)
<Toaster />
```

**Usage:**
```javascript
const { toast } = useToast();

// Success toast
toast({
  title: 'Success',
  description: 'Operation completed successfully',
});

// Error toast
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive',
});

// With action
toast({
  title: 'Scheduled',
  description: 'Event scheduled for tomorrow',
  action: (
    <Button size="sm" onClick={() => console.log('Undo')}>
      Undo
    </Button>
  ),
});

// Custom duration
toast({
  title: 'Quick message',
  duration: 2000, // 2 seconds
});
```

---

## Form Components

### Form with React Hook Form

**Example:**
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form.jsx';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="you@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## Layout Components

### Container

Standard container for page content:

```javascript
<div className="container mx-auto px-4 py-6">
  {/* Content */}
</div>
```

### Grid Layouts

```javascript
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
</div>

// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
  <Card>Column 3</Card>
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  <Card>Auto-sized card</Card>
  <Card>Auto-sized card</Card>
</div>
```

### Flexbox Layouts

```javascript
// Horizontal layout
<div className="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Vertical layout
<div className="flex flex-col space-y-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>

// Centered content
<div className="flex items-center justify-center min-h-screen">
  <Card>Centered card</Card>
</div>
```

---

## Best Practices

### Component Creation

1. **Use the generator:**
   ```bash
   npm run generate:component MyComponent
   ```

2. **Follow naming conventions:**
   - Components: PascalCase (`MyComponent.jsx`)
   - Utilities: camelCase (`formatDate.js`)
   - Constants: UPPER_SNAKE_CASE (`API_URL`)

3. **Add PropTypes or TypeScript types**

4. **Include JSDoc comments:**
   ```javascript
   /**
    * MyComponent - Brief description
    * @component
    * @param {Object} props - Component props
    * @returns {JSX.Element}
    */
   ```

5. **Write tests:**
   ```bash
   npm test MyComponent
   ```

### Accessibility Guidelines

1. **Semantic HTML:**
   ```javascript
   // ✅ Good
   <button>Click me</button>
   <nav><ul><li><a href="/">Home</a></li></ul></nav>
   
   // ❌ Bad
   <div onClick={handleClick}>Click me</div>
   ```

2. **ARIA Labels:**
   ```javascript
   <Button aria-label="Close dialog">
     <XIcon />
   </Button>
   ```

3. **Keyboard Navigation:**
   - All interactive elements must be keyboard accessible
   - Use Tab, Enter, Space, Arrow keys appropriately
   - Implement focus management in modals

4. **Color Contrast:**
   - Ensure WCAG AA compliance (4.5:1 for text)
   - Don't rely on color alone for meaning

### Performance Tips

1. **Memoization:**
   ```javascript
   const MemoizedComponent = React.memo(MyComponent);
   ```

2. **Lazy Loading:**
   ```javascript
   const HeavyComponent = lazy(() => import('./HeavyComponent.jsx'));
   ```

3. **Code Splitting:**
   ```javascript
   // Route-based splitting (already implemented in pages/index.jsx)
   ```

4. **Optimize Images:**
   ```javascript
   <img
     src="/image.jpg"
     loading="lazy"
     width="400"
     height="300"
     alt="Description"
   />
   ```

5. **Use the Performance Dashboard:**
   - Navigate to `/dev/performance` (in dev mode)
   - Monitor component render times
   - Watch API rate limits

---

## Styling Guidelines

### Tailwind CSS

1. **Use utility classes:**
   ```javascript
   <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
   ```

2. **Responsive design:**
   ```javascript
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

3. **Dark mode:**
   ```javascript
   <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
   ```

4. **Custom classes in tailwind.config.js:**
   ```javascript
   theme: {
     extend: {
       colors: {
         brand: {
           primary: '#...',
           secondary: '#...',
         },
       },
     },
   }
   ```

### CSS Variables

Access design tokens via CSS variables:

```javascript
<div style={{ color: 'hsl(var(--primary))' }}>
  Primary color text
</div>
```

---

## Component Patterns

### Compound Components

```javascript
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Render Props

```javascript
<DataLoader
  load={fetchData}
  render={({ data, loading, error }) => (
    loading ? <Spinner /> :
    error ? <Error message={error} /> :
    <DataView data={data} />
  )}
/>
```

### Higher-Order Components

```javascript
const withAuth = (Component) => {
  return (props) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
};

export default withAuth(ProtectedPage);
```

---

## Testing Components

### Unit Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button.jsx';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Integration Tests

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyPage from './MyPage.jsx';

describe('MyPage Integration', () => {
  it('loads and displays data', async () => {
    const queryClient = new QueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <MyPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    });
  });
});
```

---

## Resources

- **Radix UI Docs:** https://radix-ui.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Hook Form:** https://react-hook-form.com/
- **Zod Validation:** https://zod.dev/
- **Testing Library:** https://testing-library.com/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Getting Help

- Check existing components in `components/ui/`
- Generate new components: `npm run generate:component MyComponent`
- Run tests: `npm test`
- View performance: Navigate to `/dev/performance` (dev mode)
- Analyze bundle: `npm run analyze`
- Check dependencies: `npm run check:deps`
