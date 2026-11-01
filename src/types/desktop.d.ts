export {};

type DesktopUpdateStatus = Readonly<{
  state: "idle" | "checking" | "available" | "downloading" | "ready" | "up-to-date" | "error";
  version?: string;
  percent?: number;
  message?: string;
}>;

declare global {
  interface Window {
    readonly obaolDesktop?: Readonly<{
      isDesktop: true;
      platform: "darwin" | "win32" | "linux" | string;
      version: string;
      focusWindow: () => void;
      openPublicPage?: (page: "home" | "account-types") => void;
      checkForUpdates?: () => Promise<DesktopUpdateStatus>;
      downloadUpdate?: () => Promise<DesktopUpdateStatus>;
      installUpdate?: () => Promise<DesktopUpdateStatus>;
      onUpdateStatus?: (listener: (status: DesktopUpdateStatus) => void) => () => void;
    }>;
  }
}
