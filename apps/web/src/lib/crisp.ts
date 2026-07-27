export const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID?.trim() ?? '';

export function isCrispEnabled(): boolean {
  return CRISP_WEBSITE_ID.length > 0;
}

type CrispCommand = [string, ...unknown[]];

declare global {
  interface Window {
    $crisp?: CrispCommand[];
    CRISP_WEBSITE_ID?: string;
  }
}

function pushCrispCommand(command: CrispCommand): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.$crisp = window.$crisp ?? [];
  window.$crisp.push(command);
}

export function hideCrispChatbox(): void {
  pushCrispCommand(['do', 'chat:hide']);
}

export function openCrispChat(): void {
  pushCrispCommand(['do', 'chat:show']);
  pushCrispCommand(['do', 'chat:open']);
}

export function configureCrispChatbox(): void {
  pushCrispCommand(['safe', true]);
  hideCrispChatbox();
}
