declare module 'crypto-js' {
  interface WordArray {
    random(wordCount: number): WordArray;
    toString(encoder?: any): string;
  }

  interface Encoder {
    parse(str: string): WordArray;
  }

  interface EncoderNamespace {
    Utf8: Encoder;
    Hex: Encoder;
  }

  interface CipherParams {
    toString(): string;
  }

  interface AES {
    encrypt(message: string, key: string): CipherParams;
    decrypt(ciphertext: string, key: string): WordArray;
  }

  interface PaddingNamespace {
    Pkcs7: any;
  }

  interface ModeNamespace {
    CBC: any;
  }

  const AES: AES;
  const enc: EncoderNamespace;
  const lib: { WordArray: { random(wordCount: number): WordArray } };
  const mode: ModeNamespace;
  const pad: PaddingNamespace;
  
  function SHA256(message: string): WordArray;
  function PBKDF2(message: string, salt: string, options?: { keySize: number, iterations: number }): WordArray;
  function HmacSHA256(message: string, key: string): WordArray;

  export { 
    AES,
    enc,
    lib,
    mode,
    pad,
    SHA256,
    PBKDF2,
    HmacSHA256
  };
} 