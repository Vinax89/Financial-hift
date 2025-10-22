# 🎨 Financial $hift Design System

**Version**: 1.0.0  
**Last Updated**: October 22, 2025

---

## 📐 Design Principles

### 1. **Consistency**
Every component follows the same patterns, spacing, and visual language.

### 2. **Accessibility**
All interactions meet WCAG AA standards with AAA touch targets (44px minimum).

### 3. **Responsiveness**
Mobile-first design that scales beautifully across all devices.

### 4. **Performance**
Optimized animations and transitions for smooth 60fps experiences.

### 5. **Theme Awareness**
Full support for light, dark, and OLED themes with smooth transitions.

---

## 🎯 Design Tokens

### Spacing Scale
Based on 4px grid system for visual harmony.

```typescript
import { SPACING } from '@/design-system/DesignTokens';

// Usage
<div style={{ padding: SPACING.base }}>   // 16px
<div style={{ margin: SPACING.xl }}>      // 24px
```

| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Micro spacing, tight layouts |
| `sm` | 8px | Small gaps between related items |
| `md` | 12px | Compact layouts |
| `base` | 16px | Standard spacing (default) |
| `lg` | 20px | Section spacing |
| `xl` | 24px | Large section gaps |
| `2xl` | 32px | Extra large spacing |
| `3xl` | 40px | Major section dividers |
| `4xl` | 48px | Page section breaks |
| `5xl` | 64px | Hero spacing |

### Typography

```typescript
import { TYPOGRAPHY } from '@/design-system/DesignTokens';
import { headingStyles } from '@/design-system/ComponentUtils';

// Usage
<h1 className={headingStyles('h1')}>Page Title</h1>
<h2 className={headingStyles('h2', { gradient: true })}>Section</h2>
```

| Level | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| `h1` | 36-48px | 40-52px | Bold (700) | Page titles |
| `h2` | 30-36px | 36-40px | Bold (700) | Section headers |
| `h3` | 24-30px | 32-36px | Semibold (600) | Subsections |
| `h4` | 20-24px | 28-32px | Semibold (600) | Card titles |
| `h5` | 18-20px | 28px | Semibold (600) | Small headings |
| `h6` | 16-18px | 24-28px | Semibold (600) | Micro headings |
| `body` | 16px | 24px | Normal (400) | Body text |
| `small` | 14px | 20px | Normal (400) | Captions, labels |
| `xs` | 12px | 16px | Medium (500) | Micro text |

### Colors

All colors use CSS variables for theme awareness:

```tsx
// Semantic colors (theme-aware)
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"
className="bg-destructive text-destructive-foreground"

// Border and input
className="border-border"
className="focus:ring-ring"
```

### Shadows

```typescript
import { SHADOWS } from '@/design-system/DesignTokens';

// Usage in Tailwind
className="shadow-sm"    // Subtle shadow
className="shadow-md"    // Medium shadow
className="shadow-lg"    // Large shadow
className="shadow-xl"    // Extra large shadow
```

---

## 🧩 Component Patterns

### Buttons

Use the unified button utilities for consistency:

```tsx
import { Button } from '@/ui/button';
import { buttonEnhancements } from '@/design-system/ComponentUtils';

// Standard button
<Button variant="default" size="base">
  Click Me
</Button>

// With loading state
<Button 
  className={buttonEnhancements({ loading: true })}
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// Full width
<Button className={buttonEnhancements({ fullWidth: true })}>
  Full Width Button
</Button>
```

**Button Variants:**
- `default` - Primary action (blue background)
- `destructive` - Dangerous actions (red background)
- `outline` - Secondary actions (border only)
- `secondary` - Alternative actions (gray background)
- `ghost` - Minimal actions (no background)
- `link` - Link-styled button

**Button Sizes:**
- `sm` - 32px height (compact)
- `base` - 40px height (default)
- `lg` - 48px height (prominent)
- `icon` - Square button for icons

### Cards & Containers

```tsx
import { Card } from '@/ui/card';
import { cardStyles } from '@/design-system/ComponentUtils';

// Standard card
<Card className={cardStyles()}>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>

// Elevated card
<div className={cardStyles({ variant: 'elevated', interactive: true })}>
  Interactive elevated card
</div>

// Glass effect card
<div className={cardStyles({ variant: 'glass', padding: 'lg' })}>
  Glass morphism card
</div>
```

**Card Variants:**
- `default` - Standard card with border
- `elevated` - Card with shadow elevation
- `glass` - Glassmorphism effect with backdrop blur
- `outlined` - Transparent with prominent border

**Card Padding:**
- `none` - No padding
- `sm` - 12px padding
- `base` - 16-24px padding (default, responsive)
- `lg` - 24-32px padding (responsive)

### Form Inputs

```tsx
import { Input } from '@/ui/input';
import { inputStyles } from '@/design-system/ComponentUtils';

// Standard input
<Input 
  placeholder="Enter value" 
  className={inputStyles()}
/>

// Error state
<Input 
  className={inputStyles({ error: true })} 
  aria-invalid="true"
/>

// Different sizes
<Input className={inputStyles({ size: 'sm' })} />
<Input className={inputStyles({ size: 'base' })} />
<Input className={inputStyles({ size: 'lg' })} />
```

### Badges & Tags

```tsx
import { badgeStyles } from '@/design-system/ComponentUtils';

<span className={badgeStyles('success', 'sm')}>Active</span>
<span className={badgeStyles('warning', 'base')}>Pending</span>
<span className={badgeStyles('error', 'base')}>Failed</span>
<span className={badgeStyles('info', 'base')}>New</span>
```

### Loading States

```tsx
import { skeletonStyles, loadingState } from '@/design-system/ComponentUtils';
import { Loader2 } from 'lucide-react';

// Skeleton placeholders
<div className={skeletonStyles('text', 'w-full', 'h-4')} />
<div className={skeletonStyles('circle', 'w-12', 'h-12')} />
<div className={skeletonStyles('rectangle', 'w-full', 'h-32')} />

// Loading overlay
<div className={loadingState(isLoading)}>
  {isLoading && (
    <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin" />
  )}
  Content
</div>
```

### Empty States

```tsx
import { emptyStateStyles } from '@/design-system/ComponentUtils';
import { InboxIcon } from 'lucide-react';

<div className={emptyStateStyles({ size: 'base' })}>
  <InboxIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
  <h3 className="text-lg font-semibold mb-2">No data available</h3>
  <p className="text-muted-foreground mb-4">
    Get started by creating your first item.
  </p>
  <Button>Create New</Button>
</div>
```

---

## 🎭 Interactive States

### Hover Effects

All interactive elements should have consistent hover effects:

```tsx
import { interactiveStates } from '@/design-system/ComponentUtils';

<div className={cn('...', interactiveStates())}>
  Interactive element
</div>
```

**Standard Hover Pattern:**
- Slight scale up (102%)
- Shadow increase
- Smooth 200ms transition
- Cursor change to pointer

### Focus States

All focusable elements must have visible focus indicators:

```tsx
import { focusRing } from '@/design-system/ComponentUtils';

<button className={cn('...', focusRing())}>
  Accessible Button
</button>
```

**Focus Ring Pattern:**
- 2px ring width
- 2px offset from element
- Theme-aware color (--ring CSS variable)
- Visible only on keyboard focus (focus-visible)

### Active/Pressed States

```tsx
className="active:scale-[0.98]"
```

**Active Pattern:**
- Slight scale down (98%)
- Immediate feedback
- No delay for responsive feel

---

## 📱 Responsive Design

### Breakpoints

```typescript
import { BREAKPOINTS } from '@/design-system/DesignTokens';

// In Tailwind CSS
className="text-base md:text-lg lg:text-xl"
className="p-4 md:p-6 lg:p-8"
```

| Breakpoint | Width | Device |
|------------|-------|--------|
| `sm` | 640px+ | Large phones |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Small laptops |
| `xl` | 1280px+ | Desktops |
| `2xl` | 1536px+ | Large screens |

### Container Widths

```tsx
import { containerStyles } from '@/design-system/ComponentUtils';

<div className={containerStyles('lg', true)}>
  Centered, max-width container
</div>
```

**Container Sizes:**
- `sm` - 768px max
- `base` - 1024px max
- `lg` - 1280px max
- `xl` - 1536px max
- `full` - 100% width

---

## ✨ Animations & Transitions

### Transition Timing

```typescript
import { ANIMATION } from '@/design-system/DesignTokens';
import { transitionStyles } from '@/design-system/ComponentUtils';

// Usage
<div className={transitionStyles('all', 'base', 'easeOut')}>
  Animated element
</div>
```

**Duration Presets:**
- `fast` - 150ms (micro-interactions)
- `base` - 200ms (standard transitions)
- `moderate` - 300ms (emphasized transitions)
- `slow` - 400-600ms (dramatic effects)

**Easing Functions:**
- `easeOut` - Best for UI exits and most interactions
- `easeIn` - Best for UI entrances
- `easeInOut` - Best for continuous animations
- `bounce` - Best for playful interactions

### Animation Best Practices

1. **Use transitions, not animations** for most interactions
2. **Keep durations under 300ms** for UI feedback
3. **Prefer opacity and transform** over layout properties
4. **Use will-change sparingly** for performance
5. **Respect prefers-reduced-motion** user preference

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ♿ Accessibility Guidelines

### Touch Targets

**All interactive elements must meet minimum size requirements:**

- **Preferred**: 44px × 44px (WCAG AAA)
- **Minimum**: 24px × 24px (WCAG AA)

```tsx
// Automatically enforced in buttonEnhancements
import { buttonEnhancements } from '@/design-system/ComponentUtils';

<button className={cn('...', buttonEnhancements())}>
  Touch-friendly Button
</button>
```

### Keyboard Navigation

1. **All interactive elements** must be keyboard accessible
2. **Use semantic HTML** (button, a, input, etc.)
3. **Provide visible focus indicators** (focus-visible)
4. **Logical tab order** (use tabIndex sparingly)

### Screen Readers

1. **Use ARIA labels** for icon-only buttons
2. **Provide alt text** for all images
3. **Use semantic HTML** (header, nav, main, etc.)
4. **Announce dynamic content** (aria-live regions)

```tsx
// Icon-only button
<Button size="icon" aria-label="Delete item">
  <TrashIcon className="h-4 w-4" />
</Button>

// Loading state
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Color Contrast

**All text must meet WCAG AA standards:**

- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18px+): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

Use theme CSS variables to ensure contrast in all themes:
- `text-foreground` on `bg-background`
- `text-primary-foreground` on `bg-primary`

---

## 🌈 Theme System

### Available Themes

1. **Light** - Clean, bright interface
2. **Dark** - Easy on the eyes
3. **OLED** - True black for OLED screens

### Using Themes

```tsx
import { useTheme } from '@/theme/ThemeProvider';

function MyComponent() {
  const { theme, actualTheme, setTheme, isDark, isOled } = useTheme();
  
  return (
    <div>
      <Button onClick={() => setTheme('dark')}>Dark Mode</Button>
      <Button onClick={() => setTheme('light')}>Light Mode</Button>
      <Button onClick={() => setTheme('oled')}>OLED Mode</Button>
      <Button onClick={() => setTheme('system')}>System Default</Button>
      
      {isDark && <p>Dark theme active</p>}
      {isOled && <p>True black OLED theme</p>}
    </div>
  );
}
```

### Theme-Aware Styling

**Always use CSS variables for colors:**

```tsx
// ✅ Good - Theme-aware
className="bg-background text-foreground"
className="border-border hover:bg-muted"

// ❌ Bad - Hard-coded colors
className="bg-white text-black"
className="border-gray-200 hover:bg-gray-100"
```

---

## 📋 Component Checklist

When creating or updating a component, ensure:

- [ ] Uses design tokens (spacing, colors, typography)
- [ ] Includes all variants and sizes
- [ ] Has consistent hover, focus, and active states
- [ ] Meets 44px minimum touch target (mobile)
- [ ] Works in light, dark, and OLED themes
- [ ] Has loading and error states
- [ ] Is keyboard accessible
- [ ] Has proper ARIA labels
- [ ] Includes TypeScript types
- [ ] Has JSDoc documentation
- [ ] Uses semantic HTML elements
- [ ] Respects prefers-reduced-motion
- [ ] Has responsive breakpoints
- [ ] Passes color contrast checks

---

## 🚀 Quick Reference

### Common Patterns

```tsx
// Standard card with content
<Card className={cardStyles()}>
  <CardHeader>
    <CardTitle className={headingStyles('h4')}>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Form with validation
<form className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email"
      type="email"
      className={inputStyles({ error: !!errors.email })}
      aria-invalid={!!errors.email}
    />
    {errors.email && (
      <p className="text-destructive text-sm mt-1">{errors.email}</p>
    )}
  </div>
</form>

// Loading state
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
) : (
  <Content />
)}

// Empty state
{items.length === 0 ? (
  <div className={emptyStateStyles()}>
    <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">No items found</h3>
    <Button>Create First Item</Button>
  </div>
) : (
  <ItemList items={items} />
)}
```

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

**Made with ❤️ for Financial $hift**
