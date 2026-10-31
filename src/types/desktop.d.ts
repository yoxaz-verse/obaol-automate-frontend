export {};

declare global {
  interface Window {
    readonly obaolDesktop?: Readonly<{
      isDesktop: true;
      platform: "darwin" | "win32" | "linux" | string;
      version: string;
      focusWindow: () => void;
    }>;
  }
}
