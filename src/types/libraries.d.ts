declare module 'zod' {
  export interface ZodTypeDef {}
  export interface ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    _output: Output;
    _input: Input;
    _def: Def;
    parse(data: unknown): Output;
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    safeParse(data: unknown): { success: true; data: Output } | { success: false; error: ZodError };
  }

  export interface ZodOptional<T extends ZodType<any, any, any>> 
    extends ZodType<T['_output'] | undefined, T['_def'], T['_input'] | undefined> {
    unwrap(): T;
  }
  export interface ZodNullable<T extends ZodType<any, any, any>> 
    extends ZodType<T['_output'] | null, T['_def'], T['_input'] | null> {
    unwrap(): T;
  }

  export interface ZodString extends ZodType<string> {
    min(length: number, message?: string): ZodString;
    max(length: number, message?: string): ZodString;
    email(message?: string): ZodString;
    url(message?: string): ZodString;
    datetime(options?: { message?: string; offset?: boolean }): ZodString;
    regex(regex: RegExp, message?: string): ZodString;
  }
  export interface ZodNumber extends ZodType<number> {
    min(value: number, message?: string): ZodNumber;
    max(value: number, message?: string): ZodNumber;
    positive(message?: string): ZodNumber;
    negative(message?: string): ZodNumber;
    int(message?: string): ZodNumber;
  }
  export interface ZodBoolean extends ZodType<boolean> {}
  export interface ZodArray<T extends ZodType<any, any, any>> extends ZodType<T['_output'][]> {
    min(length: number, message?: string): ZodArray<T>;
    max(length: number, message?: string): ZodArray<T>;
  }
  export interface ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number]> {}
  export interface ZodLiteral<T> extends ZodType<T> {}
  export interface ZodUnion<T extends Readonly<[ZodType<any, any, any>, ...ZodType<any, any, any>[]]>> 
    extends ZodType<T[number]['_output']> {}
  export interface ZodIntersection<T extends ZodType<any, any, any>, U extends ZodType<any, any, any>>
    extends ZodType<T['_output'] & U['_output']> {}
  
  export interface ZodObject<T extends Record<string, ZodType<any, any, any>>> extends ZodType<{ [k in keyof T]: T[k]['_output'] }> {
    shape: T;
    strict(message?: string): ZodObject<T>;
    strip(): ZodObject<T>;
    catchall<Index extends ZodType<any, any, any>>(index: Index): ZodObject<T & { [k: string]: Index['_output'] }>;
    extend<Augmentation extends Record<string, ZodType<any, any, any>>>(augmentation: Augmentation): ZodObject<T & Augmentation>;
    merge<Incoming extends ZodObject<any>>(incoming: Incoming): ZodObject<T & Incoming['shape']>;
    pick<Mask extends { [k in keyof T]?: true }>(mask: Mask): ZodObject<{ [k in keyof Mask]: T[k] }>;
    omit<Mask extends { [k in keyof T]?: true }>(mask: Mask): ZodObject<{ [k in Exclude<keyof T, keyof Mask>]: T[k] }>;
    partial(): ZodObject<{ [k in keyof T]: ZodOptional<T[k]> }>;
  }

  export class ZodError extends Error {
    issues: Array<{ message: string; path: (string | number)[] }>;
    constructor(issues: Array<{ message: string; path: (string | number)[] }>);
  }

  export const z: {
    string: () => ZodString;
    number: () => ZodNumber;
    boolean: () => ZodBoolean;
    array: <T extends ZodType<any, any, any>>(schema: T) => ZodArray<T>;
    object: <T extends Record<string, ZodType<any, any, any>>>(shape: T) => ZodObject<T>;
    enum_: <T extends [string, ...string[]]>(values: T) => ZodEnum<T>;
    literal: <T extends string | number | boolean>(value: T) => ZodLiteral<T>;
    union: <T extends Readonly<[ZodType<any, any, any>, ...ZodType<any, any, any>[]]>>(schemas: T) => ZodUnion<T>;
    intersection: <T extends ZodType<any, any, any>, U extends ZodType<any, any, any>>(schema1: T, schema2: U) => ZodIntersection<T, U>;
    ZodError: typeof ZodError;
  };

  export const string: () => ZodString;
  export const number: () => ZodNumber;
  export const boolean: () => ZodBoolean;
  export const array: <T extends ZodType<any, any, any>>(schema: T) => ZodArray<T>;
  export const object: <T extends Record<string, ZodType<any, any, any>>>(shape: T) => ZodObject<T>;
  export const enum_: <T extends [string, ...string[]]>(values: T) => ZodEnum<T>;
  export const literal: <T extends string | number | boolean>(value: T) => ZodLiteral<T>;
  export const union: <T extends Readonly<[ZodType<any, any, any>, ...ZodType<any, any, any>[]]>>(schemas: T) => ZodUnion<T>;
  export const intersection: <T extends ZodType<any, any, any>, U extends ZodType<any, any, any>>(schema1: T, schema2: U) => ZodIntersection<T, U>;
  
  export type infer<T extends ZodType<any, any, any>> = T['_output'];
}

declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(value: T): {
    toBe: (expected: T) => void;
    toEqual: (expected: T) => void;
    toBeDefined: () => void;
    toBeUndefined: () => void;
    toBeNull: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toBeGreaterThan: (expected: number) => void;
    toBeLessThan: (expected: number) => void;
    toContain: (expected: any) => void;
    toHaveLength: (expected: number) => void;
    toHaveProperty: (property: string, value?: any) => void;
    toThrow: (expected?: string | RegExp) => void;
    resolves: any;
    rejects: any;
  };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
  export const vi: {
    fn: <T extends (...args: any[]) => any>(implementation?: T) => any;
    mock: (moduleName: string, factory?: any) => any;
    spyOn: <T, M extends keyof T>(object: T, method: M) => any;
  };
}

declare module 'crypto-js' {
  export function SHA256(data: string): { toString: () => string };
  export const AES: {
    encrypt: (data: string, key: string) => { toString: () => string };
    decrypt: (ciphertext: string, key: string) => { toString: (encoder: any) => string };
  };
  export const enc: { Utf8: any };
}

declare module 'chalk' {
  export function red(text: string): string;
  export function green(text: string): string;
  export function yellow(text: string): string;
  export function blue(text: string): string;
  export function magenta(text: string): string;
  export function cyan(text: string): string;
  export function white(text: string): string;
  export function gray(text: string): string;
  export function bold(text: string): string;
  export function underline(text: string): string;
  export default { red, green, yellow, blue, magenta, cyan, white, gray, bold, underline };
}

declare module 'date-fns' {
  export function format(date: Date, formatStr: string): string;
  export function parse(dateStr: string, formatStr: string, baseDate: Date): Date;
  export function addDays(date: Date, amount: number): Date;
  export function subDays(date: Date, amount: number): Date;
  export function addMonths(date: Date, amount: number): Date;
  export function subMonths(date: Date, amount: number): Date;
  export function isAfter(date: Date, dateToCompare: Date): boolean;
  export function isBefore(date: Date, dateToCompare: Date): boolean;
  export function isEqual(date: Date, dateToCompare: Date): boolean;
}

declare module 'framer-motion' {
  import React from 'react';
  
  export interface AnimationProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    layout?: boolean | string;
    layoutId?: string;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: any;
    onAnimationComplete?: () => void;
  }
  
  export type MotionProps = AnimationProps & React.HTMLAttributes<HTMLElement>;
  
  export interface MotionComponentProps extends MotionProps {
    as?: React.ElementType;
  }
  
  export const motion: {
    div: React.FC<MotionProps>;
    button: React.FC<MotionProps>;
    span: React.FC<MotionProps>;
    p: React.FC<MotionProps>;
    a: React.FC<MotionProps>;
    ul: React.FC<MotionProps>;
    li: React.FC<MotionProps>;
    section: React.FC<MotionProps>;
    nav: React.FC<MotionProps>;
    header: React.FC<MotionProps>;
    footer: React.FC<MotionProps>;
    img: React.FC<MotionProps>;
    svg: React.FC<MotionProps>;
    path: React.FC<MotionProps>;
  };
  
  export const AnimatePresence: React.FC<{
    initial?: boolean;
    custom?: any;
    exitBeforeEnter?: boolean;
    onExitComplete?: () => void;
    children: React.ReactNode;
  }>;
  
  export function useAnimation(): any;
  export function useMotionValue(initialValue: number): any;
  export function useTransform(value: any, inputRange: number[], outputRange: number[]): any;
  export function useViewportScroll(): { scrollX: any; scrollY: any; scrollXProgress: any; scrollYProgress: any };
}

declare module '@supabase/supabase-js' {
  export interface SupabaseResponse<T> {
    data: T | null;
    error: Error | null;
  }
  export interface SupabaseSingleResponse<T> {
    data: T | null;
    error: Error | null;
  }
  export interface SupabaseMaybeSingleResponse<T> {
    data: T | null;
    error: Error | null;
  }
  
  export interface SupabaseQueryBuilder<T> {
    select: (columns?: string) => SupabaseQueryBuilder<T>;
    insert: (data: Partial<T> | Partial<T>[], options?: any) => SupabaseQueryBuilder<T>;
    update: (data: Partial<T>, options?: any) => SupabaseQueryBuilder<T>;
    delete: (options?: any) => SupabaseQueryBuilder<T>;
    eq: (column: string, value: any) => SupabaseQueryBuilder<T>;
    neq: (column: string, value: any) => SupabaseQueryBuilder<T>;
    gt: (column: string, value: any) => SupabaseQueryBuilder<T>;
    lt: (column: string, value: any) => SupabaseQueryBuilder<T>;
    gte: (column: string, value: any) => SupabaseQueryBuilder<T>;
    lte: (column: string, value: any) => SupabaseQueryBuilder<T>;
    in: (column: string, values: any[]) => SupabaseQueryBuilder<T>;
    is: (column: string, value: 'null' | 'true' | 'false') => SupabaseQueryBuilder<T>;
    contains: (column: string, value: any) => SupabaseQueryBuilder<T>;
    containedBy: (column: string, value: any) => SupabaseQueryBuilder<T>;
    order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => SupabaseQueryBuilder<T>;
    limit: (count: number) => SupabaseQueryBuilder<T>;
    offset: (count: number) => SupabaseQueryBuilder<T>;
    then<TResult1 = SupabaseResponse<T[]>, TResult2 = never>(onfulfilled?: ((value: SupabaseResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
    single: () => Promise<SupabaseSingleResponse<T>>;
    maybeSingle: () => Promise<SupabaseMaybeSingleResponse<T>>;
  }

  export interface SupabaseClient {
    auth: {
      signIn: (params: any) => Promise<any>;
      signUp: (params: any) => Promise<any>;
      signOut: () => Promise<any>;
      getSession: () => Promise<any>;
      getUser: () => Promise<any>;
    };
    from: <T = any>(table: string) => SupabaseQueryBuilder<T>;
    storage: {
      from: (bucket: string) => {
        upload: (path: string, file: File) => Promise<any>;
        download: (path: string) => Promise<any>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } | null, error: Error | null };
        remove: (paths: string[]) => Promise<any>;
        list: (prefix?: string) => Promise<any>;
      };
    };
    rpc: (fn: string, params?: any) => Promise<any>;
  }

  export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
} 