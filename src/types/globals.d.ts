/// <reference types="node" />

// Declare Node.js global variables for scripts that need them
declare const process: {
  env: Record<string, string | undefined>;
};

declare const require: {
  (id: string): any;
  resolve: (id: string) => string;
};

declare const module: {
  exports: any;
  id: string;
}; 