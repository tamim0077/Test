declare module 'react-test-renderer' {
  export function create(element: any, options?: any): any;
  export function act(callback: () => Promise<void> | void): Promise<void>;
}

declare module '@firebase/rules-unit-testing' {
  export function initializeTestEnvironment(options: any): Promise<any>;
  export function assertFails(pr: Promise<any>): Promise<any>;
  export function assertSucceeds(pr: Promise<any>): Promise<any>;
}
