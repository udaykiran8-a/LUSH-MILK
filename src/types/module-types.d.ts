// Global types and module declarations for LUSH MILK application

/**
 * React JSX Runtime
 */
declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

/**
 * React DOM Client
 */
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(element: React.ReactNode): void;
    unmount(): void;
  };
}

/**
 * Next Themes
 */
declare module 'next-themes' {
  export const ThemeProvider: React.FC<{
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    enableColorScheme?: boolean;
    storageKey?: string;
    children: React.ReactNode;
  }>;
  
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    themes: string[];
    systemTheme: string | undefined;
  };
}

/**
 * Three.js Integration
 */
declare module '@react-three/fiber' {
  export const Canvas: React.FC<any>;
  export function useFrame(callback: (state: any, delta: number) => void, priority?: number): void;
  export function useThree(): any;
}

declare module '@react-three/drei' {
  export const OrbitControls: React.FC<any>;
  export const PerspectiveCamera: React.FC<any>;
  export const Environment: React.FC<any>;
  export const useGLTF: any;
}

/**
 * Mapbox 
 */
declare module 'mapbox-gl' {
  export default any;
}

/**
 * Other UI component libraries
 */
declare module 'cmdk' {
  export const Command: React.FC<any> & {
    Input: React.FC<any>;
    List: React.FC<any>;
    Item: React.FC<any>;
    Group: React.FC<any>;
    Separator: React.FC<any>;
    Empty: React.FC<any>;
  };
}

declare module 'embla-carousel-react' {
  export function useEmblaCarousel(options?: any): [React.RefObject<any>, any];
}

declare module 'input-otp' {
  export const OTPInput: React.FC<any>;
  export const OTPSlot: React.FC<any>;
}

declare module 'vaul' {
  export const Drawer: React.FC<any> & {
    Trigger: React.FC<any>;
    Content: React.FC<any>;
    Header: React.FC<any>;
    Title: React.FC<any>;
    Description: React.FC<any>;
    Footer: React.FC<any>;
  };
}

declare module 'recharts' {
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
} 