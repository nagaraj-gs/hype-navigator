const AUTH_STORAGE_KEY = "hype_wallet_auth";

export type WalletSession = {
  address: string;
  chainId: string;
  signedMessage: string;
  signedAt: string;
};

type RequestArguments = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

export type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: RequestArguments) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum || null;
}

export function loadWalletSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as WalletSession;
    if (!parsed.address || !parsed.chainId || !parsed.signedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWalletSession(session: WalletSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearWalletSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function connectAndSignIn(): Promise<WalletSession> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("MetaMask is not installed.");
  }

  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts?.[0];
  if (!address) {
    throw new Error("No wallet account was returned by MetaMask.");
  }

  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  const signedAt = new Date().toISOString();
  const message = `Sign in to Hype Navigator\nWallet: ${address}\nTime: ${signedAt}`;
  const signature = (await provider.request({
    method: "personal_sign",
    params: [message, address],
  })) as string;

  const session: WalletSession = {
    address,
    chainId,
    signedMessage: signature,
    signedAt,
  };
  saveWalletSession(session);
  return session;
}
