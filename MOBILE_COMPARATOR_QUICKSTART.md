# 🚀 Mobile Comparator - Quick Start Guide

## Access Points

### 1. Direct Navigation
```
URL: /comparateur-mobile
```

### 2. Test Page
```
URL: /test-mobile-comparator.html
```

### 3. From Code
```tsx
import { MobileComparator } from '@/components/mobile-comparator';
```

---

## 📂 Files Created

### Components
```
src/components/mobile-comparator/
├── MobileComparator.tsx          # Main container (251 lines)
├── SCPICard.tsx                   # Card component (152 lines)
├── FilterModal.tsx                # Filter overlay (241 lines)
├── StickySelectionFooter.tsx     # Bottom bar (52 lines)
└── index.ts                       # Exports
```

### Data
```
src/data/
└── mockScpiData.ts                # 8 SCPI examples + types
```

### Documentation
```
/
├── MOBILE_COMPARATOR_README.md           # Full documentation
├── MOBILE_COMPARATOR_QUICKSTART.md       # This file
└── public/test-mobile-comparator.html    # Demo page
```

---

## 🎯 Key Features

### 1. Card-Based Design
- Clean, readable cards for each SCPI
- Progressive disclosure (expandable details)
- Touch-optimized (44px minimum targets)

### 2. Smart Filtering
- Yield range slider (0-15%)
- Multi-select categories
- Sort by: Yield, Price, TOF, Capitalisation
- Real-time search

### 3. Multi-Select
- Checkbox on each card
- Sticky footer shows selection count
- Compare button (requires 2+ selections)

### 4. Responsive
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

---

## 🎨 Design Highlights

### Colors
```css
Primary:   Emerald (#10b981)
Accent:    Emerald Dark (#059669)
Neutral:   Slate grays
```

### Category Badges
- Diversifiée → Blue
- Résidentiel → Green
- Santé → Pink
- Bureaux → Purple
- Européenne → Yellow

---

## 📊 Sample Data

**8 SCPI included:**

| Name | Company | Yield | Price | Category |
|------|---------|-------|-------|----------|
| Comète | Alderan | 11.18% | 250€ | Diversifiée |
| Remake Live | Remake AM | 8.75% | 185€ | Résidentiel |
| Iroko Zen | Iroko | 7.21% | 210€ | Santé |
| Pierval Santé | Perial AM | 6.85% | 320€ | Santé |
| Épargne Pierre | Atland Voisin | 5.92% | 1050€ | Bureaux |
| PF Grand Paris | Perial AM | 5.45% | 1180€ | Bureaux |
| Corum XL | Corum AM | 6.25% | 1050€ | Européenne |
| Transitions Europe | La Française | 5.75% | 195€ | Diversifiée |

---

## 🔧 Development

### Run Dev Server
```bash
npm run dev
```

Navigate to: `http://localhost:5173/comparateur-mobile`

### Build
```bash
npm run build
```

The comparator is lazy-loaded, keeping initial bundle small.

---

## 💡 Usage Tips

### For Users
1. Use search to quickly find specific SCPI
2. Apply filters to narrow options
3. Expand cards to see detailed metrics
4. Select 2+ cards to compare
5. Click "Comparer" to see comparison (alert for now)

### For Developers
1. Modify `mockScpiData.ts` to add/change SCPI
2. Adjust colors in Tailwind classes
3. Extend filters in `FilterModal.tsx`
4. Add real comparison view by implementing `handleCompare()`

---

## 🎬 User Flow

```
1. Land on /comparateur-mobile
   ↓
2. See 8 SCPI cards (sorted by yield desc)
   ↓
3. [Optional] Search "Comète"
   ↓
4. [Optional] Open filters, set yield ≤ 10%
   ↓
5. Expand card to see details
   ↓
6. Select 2-3 SCPI (checkboxes)
   ↓
7. Sticky footer appears
   ↓
8. Click "Comparer"
   ↓
9. [Future] See side-by-side comparison
```

---

## 🚀 Next Steps

### Immediate
- [ ] Test on various devices (iPhone, Android, iPad)
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Performance test with 50+ SCPI

### Short-term
- [ ] Implement actual comparison view
- [ ] Add localStorage for selections
- [ ] Create shareable comparison URL
- [ ] Add PDF export

### Long-term
- [ ] Connect to real API
- [ ] Add user accounts
- [ ] Save favorite SCPI
- [ ] Historical charts

---

## 📱 Mobile Testing

### Recommended Devices
- iPhone SE (375px) - Smallest common
- iPhone 12/13 (390px)
- iPhone Pro Max (428px)
- Samsung Galaxy S21 (360px)
- iPad Mini (768px)
- iPad Pro (1024px)

### Test Checklist
- ✅ Cards are readable
- ✅ Touch targets work
- ✅ No horizontal scroll
- ✅ Filters are usable
- ✅ Footer doesn't hide content
- ✅ Smooth animations

---

## 🐛 Troubleshooting

### Cards not showing?
Check: `scpiData` is imported correctly

### Filters not working?
Check: `filters` state is updating in console

### Footer not appearing?
Check: At least 1 SCPI is selected

### Build errors?
Run: `npm install` then `npm run build`

---

## 📞 Support

**Questions?** Check the full README: `MOBILE_COMPARATOR_README.md`

**Issues?** Contact: eric.bellaiche@gmail.com

---

**Built with Vite + React + Tailwind CSS + Lucide React**

*Last Updated: 2025-12-18*
