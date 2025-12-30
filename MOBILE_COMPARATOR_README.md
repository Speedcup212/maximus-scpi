# 📱 Mobile-First SCPI Comparator

## Overview

A modern, responsive web application built with **Vite**, **React**, **Tailwind CSS**, and **Lucide React** that provides an optimized mobile experience for comparing SCPI (Real Estate Investment Trusts).

### The Problem

Traditional data tables are difficult to read and interact with on mobile devices. Complex financial data becomes cluttered, requires horizontal scrolling, and creates a poor user experience on small screens.

### The Solution

A **mobile-first card design** approach that:
- Displays each SCPI as a clean, readable card
- Uses progressive disclosure to manage information density
- Provides intuitive touch-optimized interactions
- Maintains a responsive design that scales beautifully to desktop

---

## 🚀 Quick Start

### Access the Comparator

Navigate to: **`/comparateur-mobile`**

Or use the test page: **`/test-mobile-comparator.html`**

### Development

```bash
npm run dev
```

The mobile comparator is accessible at `http://localhost:5173/comparateur-mobile`

---

## 🎨 Design Philosophy

### Mobile-First Strategy

1. **Card-Based Layout**: Each SCPI is presented as a self-contained card with clear hierarchy
2. **Progressive Disclosure**: Secondary information is hidden by default, accessible via "Voir plus"
3. **Touch-Optimized**: Minimum 44px touch targets for all interactive elements
4. **Clean Aesthetics**: Modern fintech design with emerald green accents

### Visual Hierarchy

```
┌─────────────────────────────────┐
│  [Logo] Name                 [✓]│  ← Header
│  Management Company             │
│  [Category Badge]               │
├─────────────────────────────────┤
│  ★ 11.18%                      │  ← Hero Metric (Yield)
│  Taux de Distribution           │
├─────────────────────────────────┤
│  Price: 250€  | Min: 2,500€    │  ← Primary Metrics
├─────────────────────────────────┤
│  [Expandable Details]           │  ← Progressive Disclosure
│  • TOF: 93.6%                   │
│  • Capitalisation: 121M€        │
│  • Strategy: Multi-asset...    │
├─────────────────────────────────┤
│  Voir plus de détails ▼         │  ← Expand/Collapse
└─────────────────────────────────┘
```

---

## 🏗️ Architecture

### Project Structure

```
src/
├── components/
│   └── mobile-comparator/
│       ├── MobileComparator.tsx      # Main container
│       ├── SCPICard.tsx              # Individual SCPI card
│       ├── FilterModal.tsx           # Full-screen filter overlay
│       ├── StickySelectionFooter.tsx # Selection summary bar
│       └── index.ts                  # Barrel exports
├── data/
│   └── mockScpiData.ts               # Mock SCPI data & types
└── App.tsx                           # Main app with routing
```

### Component Hierarchy

```
MobileComparator
├── Header (Search + Filter Button)
├── SCPICard[] (Grid of cards)
│   ├── Header (Logo, Name, Checkbox)
│   ├── Hero Metric (Yield)
│   ├── Primary Metrics
│   └── Expandable Details
├── FilterModal (Conditional)
│   ├── Yield Range Slider
│   ├── Category Checkboxes
│   └── Sort Options
└── StickySelectionFooter (Conditional)
    ├── Selection Count
    └── Compare Button
```

---

## 🎯 Core Features

### 1. Card Design

Each SCPI is displayed as a card with:
- **Header**: Logo placeholder, SCPI name, management company, category badge
- **Hero Metric**: Large, bold yield (Taux de Distribution)
- **Primary Metrics**: Price and minimum investment
- **Secondary Metrics**: Hidden by default, revealed on demand
- **Selection**: Checkbox for multi-select comparison

```tsx
<SCPICard
  scpi={scpiData}
  isSelected={boolean}
  onToggleSelect={(id) => void}
/>
```

### 2. Progressive Disclosure

Secondary information (TOF, Capitalisation, Strategy) is hidden initially:
- Reduces cognitive load
- Keeps cards compact
- User controls information depth
- Smooth expand/collapse animation

### 3. Filter Modal

Full-screen overlay (mobile) or centered modal (desktop):
- **Yield Range**: Slider from 0% to 15%
- **Categories**: Multi-select chips
- **Sort Options**: Yield, Price, TOF, Capitalisation
- **Sort Order**: Ascending/Descending toggle
- **Actions**: Apply or Reset filters

```tsx
<FilterModal
  isOpen={boolean}
  onClose={() => void}
  filters={filterState}
  onApplyFilters={(filters) => void}
/>
```

### 4. Sticky Selection Footer

Fixed bottom bar that appears when items are selected:
- Shows count of selected SCPI
- Displays "Comparer" button
- Disabled until 2+ items selected
- Smooth slide-in animation

```tsx
<StickySelectionFooter
  selectedCount={number}
  onCompare={() => void}
/>
```

### 5. Search Functionality

Real-time search across:
- SCPI name
- Management company
- Clear button appears when typing

---

## 📊 Data Structure

### SCPI Interface

```typescript
interface SCPIMock {
  id: string;
  name: string;                 // e.g., "Comète"
  managementCompany: string;    // e.g., "Alderan"
  yield: number;                // e.g., 11.18
  price: number;                // e.g., 250
  minInvestment: number;        // e.g., 2500
  tof: number;                  // e.g., 93.6 (Occupancy Rate)
  capitalization: string;       // e.g., "121M€"
  category: string;             // e.g., "Diversifiée"
  strategy: string;             // e.g., "Multi-asset diversification"
  logoUrl?: string;
}
```

### Mock Data

8 example SCPI included:
- Comète (Alderan) - 11.18%
- Remake Live (Remake AM) - 8.75%
- Iroko Zen (Iroko) - 7.21%
- Pierval Santé (Perial AM) - 6.85%
- Épargne Pierre (Atland Voisin) - 5.92%
- PF Grand Paris (Perial AM) - 5.45%
- Corum XL (Corum AM) - 6.25%
- Transitions Europe (La Française REM) - 5.75%

---

## 🎨 Design System

### Colors

```css
/* Primary Accent */
--emerald-500: #10b981;
--emerald-600: #059669;
--emerald-700: #047857;

/* Neutral Palette */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-600: #475569;
--slate-700: #334155;
--slate-900: #0f172a;

/* Category Colors */
Diversifiée → Blue
Résidentiel → Green
Santé → Pink
Bureaux → Purple
Européenne → Yellow
```

### Typography

```css
/* Headers */
h1: text-2xl font-bold (24px)
h2: text-xl font-bold (20px)
h3: text-lg font-bold (18px)

/* Body */
p: text-sm (14px)
small: text-xs (12px)

/* Hero Metric */
yield: text-4xl font-bold (36px)
```

### Spacing

8px spacing system:
- `gap-2` = 8px
- `gap-3` = 12px
- `gap-4` = 16px
- `p-4` = 16px
- `p-6` = 24px

### Touch Targets

Minimum 44px for all interactive elements:
- Checkboxes: 24px (6×6)
- Buttons: min-height 44px
- Cards: Full width, ample padding

---

## 📱 Responsive Breakpoints

### Mobile (Default)

- Single column card layout
- Full-screen filter modal
- Bottom-fixed selection footer
- Large touch targets

### Tablet (md: 768px+)

- 2-column card grid
- Centered filter modal
- Enhanced spacing

### Desktop (lg: 1024px+)

- 3-column card grid
- Or switch to table view (optional)
- Hover effects enabled

```tsx
// Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🔧 State Management

### Main Component State

```typescript
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [searchQuery, setSearchQuery] = useState('');
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [filters, setFilters] = useState({
  yieldRange: [0, 15] as [number, number],
  selectedCategories: [] as string[],
  sortBy: 'yield' as 'yield' | 'price' | 'tof' | 'capitalization',
  sortOrder: 'desc' as 'asc' | 'desc'
});
```

### Filtering Logic

```typescript
const filteredAndSortedData = useMemo(() => {
  let result = [...scpiData];

  // Search
  if (searchQuery) {
    result = result.filter(scpi =>
      scpi.name.includes(searchQuery) ||
      scpi.managementCompany.includes(searchQuery)
    );
  }

  // Yield range
  result = result.filter(scpi =>
    scpi.yield >= filters.yieldRange[0] &&
    scpi.yield <= filters.yieldRange[1]
  );

  // Categories
  if (filters.selectedCategories.length > 0) {
    result = result.filter(scpi =>
      filters.selectedCategories.includes(scpi.category)
    );
  }

  // Sorting
  result.sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    return (a[filters.sortBy] - b[filters.sortBy]) * order;
  });

  return result;
}, [searchQuery, filters]);
```

---

## 🎭 Animations

### Card Expansion

```tsx
{isExpanded && (
  <div className="animate-in slide-in-from-top duration-200">
    {/* Secondary content */}
  </div>
)}
```

### Footer Slide-In

```tsx
<div className="animate-in slide-in-from-bottom duration-300">
  {/* Footer content */}
</div>
```

### Button Press

```css
.active:scale-95
```

---

## 🧪 Testing Checklist

### Mobile Experience
- [ ] Cards are readable on 320px screens
- [ ] Touch targets are at least 44px
- [ ] No horizontal scroll required
- [ ] Filter modal fills viewport
- [ ] Footer doesn't obstruct content

### Interactions
- [ ] Search updates in real-time
- [ ] Filters apply correctly
- [ ] Selection persists across filter changes
- [ ] Compare button enables at 2+ selections
- [ ] Card expansion is smooth

### Performance
- [ ] Cards render without lag
- [ ] Filter changes are instant
- [ ] No memory leaks on selection
- [ ] Smooth scrolling

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible

---

## 🚢 Deployment

### Build

```bash
npm run build
```

The mobile comparator is included in the main build as a lazy-loaded route.

### Route

```typescript
// App.tsx routing
if (path === 'comparateur-mobile') {
  setCurrentView('comparateur-mobile');
}

// Rendering
{currentView === 'comparateur-mobile' && (
  <Suspense fallback={<LoadingSpinner />}>
    <MobileComparator />
  </Suspense>
)}
```

---

## 📚 Best Practices Applied

### 1. Component Organization

- Single Responsibility: Each component has one clear purpose
- Composition over Inheritance
- Props drilling avoided with local state
- Barrel exports for clean imports

### 2. Performance

- Lazy loading with React.Suspense
- useMemo for expensive filtering
- No unnecessary re-renders
- Efficient state updates

### 3. User Experience

- Immediate visual feedback
- Loading states
- Empty states
- Error prevention (disabled states)
- Optimistic UI updates

### 4. Code Quality

- TypeScript for type safety
- Consistent naming conventions
- Clear component interfaces
- Self-documenting code

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Comparison view (side-by-side cards)
- [ ] Save selections to localStorage
- [ ] Share selected SCPI via URL
- [ ] Export comparison as PDF

### Phase 3
- [ ] Integration with real API
- [ ] User preferences persistence
- [ ] Advanced filters (geography, strategy)
- [ ] Historical performance charts

### Phase 4
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] PWA capabilities

---

## 📖 Usage Examples

### Basic Integration

```tsx
import { MobileComparator } from '@/components/mobile-comparator';

function App() {
  return <MobileComparator />;
}
```

### With Custom Data

```tsx
import { MobileComparator } from '@/components/mobile-comparator';
import { myScpiData } from './data';

// Update src/data/mockScpiData.ts with your data
export const scpiData: SCPIMock[] = myScpiData;
```

### Styling Customization

```tsx
// Modify colors in Tailwind classes
// Primary: emerald-600 → your-color
// Accent: emerald-500 → your-accent
```

---

## 🤝 Contributing

### Adding New Features

1. Create component in `src/components/mobile-comparator/`
2. Export from `index.ts`
3. Import and use in `MobileComparator.tsx`
4. Update this README

### Code Style

- Use TypeScript
- Follow existing patterns
- Add PropTypes interfaces
- Include accessibility attributes

---

## 📄 License

This mobile comparator is part of the MaximusSCPI project.

---

## 🙏 Acknowledgments

- **Vite**: Blazing fast build tool
- **React**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon set
- **Mobile-First Design**: Inspired by modern fintech apps

---

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact: eric.bellaiche@gmail.com

---

**Built with ❤️ for optimal mobile financial experiences**
