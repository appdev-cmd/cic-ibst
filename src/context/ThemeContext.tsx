import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'nature' | 'light' | 'dark';
export type PrimaryColor = 'teal' | 'red' | 'blue';

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
    '--color-primary': '#0f52ba',
    '--color-primary-50': '239 246 255',
    '--color-primary-100': '219 234 254',
    '--color-primary-200': '191 219 254',
    '--color-primary-300': '147 197 253',
    '--color-primary-400': '96 165 250',
    '--color-primary-500': '15 82 186',
    '--color-primary-600': '29 78 216',
    '--color-primary-700': '30 64 175',
    '--color-primary-800': '30 58 138',
    '--color-primary-900': '23 37 84',
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
    return saved === 'teal' || saved === 'red' || saved === 'blue' ? saved : 'teal';
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
