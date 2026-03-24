import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ChevronRight, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  connectAndSignIn,
  getEthereumProvider,
  loadWalletSession,
  shortenAddress,
} from "@/lib/walletAuth";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    const session = loadWalletSession();
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const hasMetaMask = useMemo(() => Boolean(getEthereumProvider()), []);

  const handleConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      const session = await connectAndSignIn();
      setWallet(session.address);
      setChainId(session.chainId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet sign-in failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-bg-subtle relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl glass-strong rounded-3xl p-8 md:p-10 glow-border">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Secure Access</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 gradient-text">Connect MetaMask</h1>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Sign in with your wallet to unlock the Hype Navigator dashboard, alerts, and real-time meme coin intelligence.
            </p>
          </div>

          <div className="glass rounded-2xl p-5 mb-6 border border-primary/20">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Wallet Authentication</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We request your wallet address and signature for a secure session. No private keys are ever requested.
                </p>
              </div>
            </div>
          </div>

          {wallet && (
            <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Connected {shortenAddress(wallet)} {chainId ? `(Chain ${chainId})` : ""}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={handleConnect}
              disabled={!hasMetaMask || loading}
            >
              {loading ? "Awaiting wallet approval..." : "Login with MetaMask"}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </Button>

            {!hasMetaMask && (
              <Button
                variant="hero-outline"
                size="lg"
                className="flex-1"
                onClick={() => window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer")}
              >
                Install MetaMask
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Need public access first? <Link to="/" className="text-primary hover:underline">Back to landing page</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
