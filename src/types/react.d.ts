/**
 * React TypeScript definitions for LUSH MILK application
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Export React hooks
export const useState: typeof React.useState;
export const useEffect: typeof React.useEffect;
export const useRef: typeof React.useRef;
export const useCallback: typeof React.useCallback;
export const useMemo: typeof React.useMemo;
export const useContext: typeof React.useContext;

// Export React lazy loading
export const Suspense: typeof React.Suspense;
export const lazy: typeof React.lazy;

// Export React event types
export type FormEvent<T = Element> = React.FormEvent<T>;
export type ChangeEvent<T = Element> = React.ChangeEvent<T>;
export type MouseEvent<T = Element> = React.MouseEvent<T>;
export type KeyboardEvent<T = Element> = React.KeyboardEvent<T>;

// Export React component types
export type FC<P = {}> = React.FC<P>;
export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;
export type ReactChildren = React.ReactNode;

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {
      div: any;
      span: any;
      p: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      a: any;
      button: any;
      input: any;
      form: any;
      label: any;
      ul: any;
      ol: any;
      li: any;
      table: any;
      tr: any;
      td: any;
      th: any;
      thead: any;
      tbody: any;
      section: any;
      main: any;
      header: any;
      footer: any;
      article: any;
      nav: any;
      aside: any;
    }
    interface ElementChildrenAttribute extends React.PropsWithChildren<{}> {}
  }
}

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

// Add module declarations for missing dependencies
declare module '@tanstack/react-query' {
  export const QueryClient: any;
  export const QueryClientProvider: any;
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const useParams: any;
  export const Link: any;
} 