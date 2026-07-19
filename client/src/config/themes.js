// Theme metadata for pickers. Palette values themselves live in src/themes.css
// (generated — see the scratchpad theme generator referenced in commit history).

// Hero background photos (Unsplash) matching each theme's identity, shown on the Home feed header.
const HOME_HERO_IMAGES = {
  'maize-field': 'https://images.unsplash.com/photo-1567547921486-f280c2f53b5d',
  'golden-wheat': 'https://images.unsplash.com/photo-1753866551936-998e5fcf6d5f',
  'rice-paddy': 'https://images.unsplash.com/photo-1519082572439-7ed19908e47e',
  'forest-canopy': 'https://images.unsplash.com/photo-1762316565332-823ac642caec',
  'meadow-bloom': 'https://images.unsplash.com/photo-1744986924545-08e6d543bd84',
  'coffee-farm': 'https://images.unsplash.com/photo-1515694590185-73647ba02c10',
  sunflower: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651',
  savanna: 'https://images.unsplash.com/photo-1757777598981-2a589811168d',
}

export function getHomeHeroImage(themeId) {
  return `${HOME_HERO_IMAGES[themeId] || HOME_HERO_IMAGES['maize-field']}?w=1600&q=75&fit=crop&auto=format`
}

export const MAIN_THEME_CATEGORIES = [
  {
    category: 'Crops & Fields',
    themes: [
      { id: 'maize-field', name: 'Maize Field', swatch: '#28bd5f' },
      { id: 'golden-wheat', name: 'Golden Wheat', swatch: '#d49a11' },
      { id: 'rice-paddy', name: 'Rice Paddy', swatch: '#3cb82e' },
    ],
  },
  {
    category: 'Plants & Forest',
    themes: [
      { id: 'forest-canopy', name: 'Forest Canopy', swatch: '#34b299' },
      { id: 'meadow-bloom', name: 'Meadow Bloom', swatch: '#62a63f' },
    ],
  },
  {
    category: 'Harvest & Animals',
    themes: [
      { id: 'coffee-farm', name: 'Coffee Farm', swatch: '#a66a3f' },
      { id: 'sunflower', name: 'Sunflower', swatch: '#daaa0b' },
      { id: 'savanna', name: 'Savanna', swatch: '#b25a34' },
    ],
  },
]

export const ADMIN_THEME_CATEGORIES = [
  {
    category: 'Professional',
    themes: [
      { id: 'slate', name: 'Slate', swatch: '#5c6f8a' },
      { id: 'wheat-ink', name: 'Wheat & Ink', swatch: '#4b639b' },
    ],
  },
  {
    category: 'Nature',
    themes: [
      { id: 'meadow', name: 'Meadow', swatch: '#34b262' },
      { id: 'forest', name: 'Forest', swatch: '#39ac95' },
    ],
  },
  {
    category: 'Harvest',
    themes: [
      { id: 'terracotta', name: 'Terracotta', swatch: '#b25a34' },
      { id: 'coffee', name: 'Coffee', swatch: '#a66a3f' },
    ],
  },
]

export const DEFAULT_MAIN_THEME = 'maize-field'
export const DEFAULT_ADMIN_THEME = 'slate'
