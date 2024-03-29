export declare const hash: (text: string, options?: {
    type: string;
    secret: null;
}) => string;
export declare const encrypt: (message: string | number, secret: string) => string;
export declare const encryptFile: (absolutePath: string, secret: string) => string;
export declare const decrypt: (message: string, secret: string) => string;
export declare const decryptFile: (absolutePath: string, secret: string) => string;
