import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'nature' | 'light' | 'dark';
export type PrimaryColor =
  | 'teal'
  | 'red'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'cyan'
  | 'indigo';

// Danh sách màu chủ đạo hiển thị trên bộ chọn — đồng bộ cơ chế đa tông màu của qa-qtdn
export const PRIMARY_COLORS: { id: PrimaryColor; name: string; hex: string }[] = [
  { id: 'teal', name: 'Teal Doanh Nghiệp', hex: '#00668c' },
  { id: 'red', name: 'Đỏ Cờ IBST', hex: '#ae1e23' },
  { id: 'blue', name: 'Xanh Dương', hex: '#2563eb' },
  { id: 'emerald', name: 'Ngọc Lục Bảo', hex: '#059669' },
  { id: 'amber', name: 'Hoàng Kim', hex: '#d97706' },
  { id: 'rose', name: 'Hồng Ngọc', hex: '#e11d48' },
  { id: 'violet', name: 'Thạch Anh Tím', hex: '#7c3aed' },
  { id: 'cyan', name: 'Đại Dương', hex: '#0891b2' },
  { id: 'indigo', name: 'Chàm Tím', hex: '#4f46e5' },
];

// Token 3 theme — đồng bộ THEME_TOKENS của qlda-ddcn-ht (context/ThemeContext.tsx)
const THEME_TOKENS: Record<Theme, Record<string, string>> = {
  nature: {
    '--bg-app': '#F0ECE1',
    '--bg-surface': '#FCF9F2',
    '--bg-subtle': '#F5EFE6',
    '--bg-muted': '#EDE8DF',
    '--bg-elevated': '#FDFAF4',
    '--border-default': '#ece7de',
    '--border-subtle': '#e5dfd4',
    '--text-primary': '#1d1c1c',
    '--text-secondary': '#4a3426',
    '--text-muted': '#6d665f',
    '--text-placeholder': '#736b62',
    '--bg-hover-row': '#F5EFE6',
    '--bg-stripe': '#F8F5EC',
    '--shadow-card': '0 1px 2px 0 rgb(74 49 16 / 0.04), 0 1px 3px 0 rgb(74 49 16 / 0.06)',
    '--shadow-card-hover': '0 8px 20px -4px rgb(74 49 16 / 0.10), 0 4px 8px -4px rgb(74 49 16 / 0.06)',
    '--shadow-dropdown': '0 10px 15px -3px rgb(74 49 16 / 0.10), 0 4px 6px -4px rgb(74 49 16 / 0.06)',
    '--scrollbar-thumb': '#d6cfc4',
    '--scrollbar-thumb-hover': '#b8b0a3',
  },
  light: {
    '--bg-app': '#f1f5f9',
    '--bg-surface': '#ffffff',
    '--bg-subtle': '#f8fafc',
    '--bg-muted': '#f1f5f9',
    '--bg-elevated': '#ffffff',
    '--border-default': '#e2e8f0',
    '--border-subtle': '#f1f5f9',
    '--text-primary': '#0f172a',
    '--text-secondary': '#334155',
    '--text-muted': '#64748b',
    '--text-placeholder': '#6b7280',
    '--bg-hover-row': '#f1f5f9',
    '--bg-stripe': '#f8fafc',
    '--shadow-card': '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
    '--shadow-card-hover': '0 8px 20px -4px rgb(15 23 42 / 0.10), 0 4px 8px -4px rgb(15 23 42 / 0.06)',
    '--shadow-dropdown': '0 10px 15px -3px rgb(15 23 42 / 0.10), 0 4px 6px -4px rgb(15 23 42 / 0.06)',
    '--scrollbar-thumb': '#cbd5e1',
    '--scrollbar-thumb-hover': '#94a3b8',
  },
  dark: {
    '--bg-app': '#0f1117',
    '--bg-surface': '#1f2332',
    '--bg-subtle': '#1a1e2e',
    '--bg-muted': '#252a3b',
    '--bg-elevated': '#252a3b',
    '--border-default': '#222533',
    '--border-subtle': '#191b26',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#e2e8f0',
    '--text-muted': '#94a3b8',
    '--text-placeholder': '#7c8aa0',
    '--bg-hover-row': '#252a3b',
    '--bg-stripe': '#1c2030',
    '--shadow-card': '0 1px 3px 0 rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.03)',
    '--shadow-card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.04)',
    '--shadow-dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.04)',
    '--scrollbar-thumb': '#2e3548',
    '--scrollbar-thumb-hover': '#3d4560',
  },
};

const PRIMARY_COLOR_TOKENS: Record<PrimaryColor, Record<string, string>> = {
  teal: {
    '--color-primary': '#00668c',
    '--color-primary-50': '242 248 252',
    '--color-primary-100': '212 234 247',
    '--color-primary-200': '182 204 216',
    '--color-primary-300': '113 196 239',
    '--color-primary-400': '57 149 184',
    '--color-primary-500': '0 102 140',
    '--color-primary-600': '0 82 115',
    '--color-primary-700': '0 65 90',
    '--color-primary-800': '0 48 71',
    '--color-primary-900': '0 31 48',
  },
  red: {
    '--color-primary': '#ae1e23',
    '--color-primary-50': '254 242 242',
    '--color-primary-100': '254 226 226',
    '--color-primary-200': '252 165 165',
    '--color-primary-300': '248 113 113',
    '--color-primary-400': '239 68 68',
    '--color-primary-500': '174 30 35',
    '--color-primary-600': '153 27 27',
    '--color-primary-700': '139 24 28',
    '--color-primary-800': '127 29 29',
    '--color-primary-900': '69 10 10',
  },
  blue: {
    '--color-primary': '#2563eb',
    '--color-primary-50': '239 246 255',
    '--color-primary-100': '219 234 254',
    '--color-primary-200': '191 219 254',
    '--color-primary-300': '147 197 253',
    '--color-primary-400': '96 165 250',
    '--color-primary-500': '37 99 235',
    '--color-primary-600': '29 78 216',
    '--color-primary-700': '30 64 175',
    '--color-primary-800': '30 58 138',
    '--color-primary-900': '23 37 84',
  },
  emerald: {
    '--color-primary': '#059669',
    '--color-primary-50': '236 253 245',
    '--color-primary-100': '209 250 229',
    '--color-primary-200': '167 243 208',
    '--color-primary-300': '110 231 183',
    '--color-primary-400': '52 211 153',
    '--color-primary-500': '5 150 105',
    '--color-primary-600': '4 120 87',
    '--color-primary-700': '6 95 70',
    '--color-primary-800': '6 78 59',
    '--color-primary-900': '2 44 34',
  },
  amber: {
    '--color-primary': '#d97706',
    '--color-primary-50': '255 251 235',
    '--color-primary-100': '254 243 199',
    '--color-primary-200': '253 230 138',
    '--color-primary-300': '252 211 77',
    '--color-primary-400': '251 191 36',
    '--color-primary-500': '217 119 6',
    '--color-primary-600': '180 83 9',
    '--color-primary-700': '146 64 14',
    '--color-primary-800': '120 53 15',
    '--color-primary-900': '69 26 3',
  },
  rose: {
    '--color-primary': '#e11d48',
    '--color-primary-50': '255 241 242',
    '--color-primary-100': '255 228 230',
    '--color-primary-200': '254 205 211',
    '--color-primary-300': '253 164 175',
    '--color-primary-400': '251 113 133',
    '--color-primary-500': '225 29 72',
    '--color-primary-600': '190 18 60',
    '--color-primary-700': '159 18 57',
    '--color-primary-800': '136 19 55',
    '--color-primary-900': '76 5 25',
  },
  violet: {
    '--color-primary': '#7c3aed',
    '--color-primary-50': '245 243 255',
    '--color-primary-100': '237 233 254',
    '--color-primary-200': '221 214 254',
    '--color-primary-300': '196 181 253',
    '--color-primary-400': '167 139 250',
    '--color-primary-500': '124 58 237',
    '--color-primary-600': '109 40 217',
    '--color-primary-700': '91 33 182',
    '--color-primary-800': '76 29 149',
    '--color-primary-900': '46 16 101',
  },
  cyan: {
    '--color-primary': '#0891b2',
    '--color-primary-50': '236 254 255',
    '--color-primary-100': '207 250 254',
    '--color-primary-200': '165 243 252',
    '--color-primary-300': '103 232 249',
    '--color-primary-400': '34 211 238',
    '--color-primary-500': '8 145 178',
    '--color-primary-600': '14 116 144',
    '--color-primary-700': '21 94 117',
    '--color-primary-800': '22 78 99',
    '--color-primary-900': '8 51 68',
  },
  indigo: {
    '--color-primary': '#4f46e5',
    '--color-primary-50': '238 242 255',
    '--color-primary-100': '224 231 255',
    '--color-primary-200': '199 210 254',
    '--color-primary-300': '165 180 252',
    '--color-primary-400': '129 140 248',
    '--color-primary-500': '79 70 229',
    '--color-primary-600': '67 56 202',
    '--color-primary-700': '55 48 163',
    '--color-primary-800': '49 46 129',
    '--color-primary-900': '30 27 75',
  },
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  Object.entries(THEME_TOKENS[theme]).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function applyPrimaryColor(color: PrimaryColor) {
  const root = document.documentElement;
  Object.entries(PRIMARY_COLOR_TOKENS[color]).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (c: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'nature',
  setTheme: () => {},
  primaryColor: 'teal',
  setPrimaryColor: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || saved === 'light' || saved === 'nature' ? saved : 'nature';
  });

  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(() => {
    const saved = localStorage.getItem('primaryColor');
    return PRIMARY_COLORS.some((c) => c.id === saved) ? (saved as PrimaryColor) : 'teal';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }, []);

  const setPrimaryColor = useCallback((c: PrimaryColor) => {
    setPrimaryColorState(c);
    localStorage.setItem('primaryColor', c);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
