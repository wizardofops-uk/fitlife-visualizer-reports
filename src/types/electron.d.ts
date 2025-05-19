interface ElectronAPI {
  on(channel: string, callback: (event: any, ...args: any[]) => void): void;
  removeListener(channel: string, callback: (event: any, ...args: any[]) => void): void;
  openExternal(url: string): void;
  fitbitExchangeToken: (params: { code: string, clientId: string, codeVerifier: string, redirectUri: string }) => Promise<any>;
  fitbitApiFetch: (params: { url: string, accessToken: string }) => Promise<any>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    process?: {
      versions?: {
        electron?: string;
      };
    };
  }
}

export {}; 