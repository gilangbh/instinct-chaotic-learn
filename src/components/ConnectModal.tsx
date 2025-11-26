import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Wallet, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { Panel } from '@/components/ui/instinct/Panel';
import { Button } from '@/components/ui/instinct/Button';
import { Badge } from '@/components/ui/instinct/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { api } from '@/lib/api';
import { generateUsername } from '@/lib/usernameGenerator';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  installed: boolean;
}

export const ConnectModal = ({ isOpen, onClose }: ConnectModalProps) => {
  const navigate = useNavigate();
  const { login, loginWithWallet } = useAuth();
  const { publicKey, wallet: currentWallet, connect, disconnect, connected, connecting, wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameForWallet, setUsernameForWallet] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    const detectWallets = () => {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const wallets: WalletInfo[] = [
        {
          name: 'Phantom',
          icon: '👻',
          url: isMobile ? 'https://phantom.app/download' : 'https://phantom.app/',
          installed: !!(window as any).solana?.isPhantom
        },
        {
          name: 'Solflare',
          icon: '☀️',
          url: isMobile ? 'https://solflare.com/download' : 'https://solflare.com/',
          installed: !!(window as any).solflare
        },
        {
          name: 'Backpack',
          icon: '🎒',
          url: isMobile ? 'https://backpack.app/download' : 'https://backpack.app/',
          installed: !!(window as any).backpack
        },
      ];

      if (isMobile) {
        setAvailableWallets(wallets.map(wallet => ({ ...wallet, installed: true })));
      } else {
        setAvailableWallets(wallets);
      }
    };

    detectWallets();
    window.addEventListener('load', detectWallets);
    return () => window.removeEventListener('load', detectWallets);
  }, []);

  const handleConnectWallet = async (wallet: WalletInfo) => {
    try {
      setIsLoading(true);
      setError('');
      
      const walletAdapter = wallets.find(w => {
        const adapterName = w.adapter.name;
        return (wallet.name === 'Phantom' && adapterName === 'Phantom') ||
               (wallet.name === 'Solflare' && adapterName === 'Solflare');
      });

      if (!walletAdapter) {
        throw new Error(`${wallet.name} wallet adapter not found. Please refresh the page.`);
      }

      if (connected && currentWallet && currentWallet.adapter.name !== walletAdapter.adapter.name) {
        try {
          await disconnect();
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (disconnectErr) {
          console.warn('Error disconnecting:', disconnectErr);
        }
      }

      if (connected && currentWallet && currentWallet.adapter.name === walletAdapter.adapter.name && publicKey) {
        const publicKeyStr = publicKey.toString();
        let provider: any = null;
        if (wallet.name === 'Phantom' && (window as any).solana?.isPhantom) {
          provider = (window as any).solana;
        } else if (wallet.name === 'Solflare' && (window as any).solflare) {
          provider = (window as any).solflare;
        }

        setConnectedWallet({
          provider,
          publicKey: publicKeyStr,
          walletName: wallet.name
        });
        setSelectedWallet(wallet);
        
        setIsCheckingWallet(true);
        try {
          const response = await api.users.getByWallet(publicKeyStr);
          if (response.success && response.data) {
            setExistingUser(response.data);
          } else {
            setExistingUser(null);
          }
        } catch (err) {
          setExistingUser(null);
        } finally {
          setIsCheckingWallet(false);
        }
        
        setIsLoading(false);
        return;
      }

      let windowProvider: any = null;
      if (wallet.name === 'Phantom') {
        windowProvider = (window as any).solana;
        if (!windowProvider || !windowProvider.isPhantom) {
          throw new Error('Phantom wallet is not installed. Please install Phantom and refresh the page.');
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (wallet.name === 'Solflare') {
        windowProvider = (window as any).solflare;
        if (!windowProvider) {
          throw new Error('Solflare wallet is not installed. Please install Solflare and refresh the page.');
        }
      }

      let connectionSucceeded = false;
      try {
        await walletAdapter.adapter.connect();
        connectionSucceeded = true;
      } catch (adapterErr: any) {
        if (windowProvider && typeof windowProvider.connect === 'function') {
          try {
            await windowProvider.connect();
            connectionSucceeded = true;
          } catch (directErr: any) {
            if (directErr.code === 4001 || directErr.message?.includes('User rejected')) {
              throw new Error('Connection cancelled by user.');
            }
            throw new Error(`Failed to connect: ${directErr.message || adapterErr.message}`);
          }
        } else {
          throw adapterErr;
        }
      }

      let publicKeyStr: string | null = null;
      let attempts = 0;
      while (attempts < 30) {
        if (walletAdapter.adapter.publicKey) {
          publicKeyStr = walletAdapter.adapter.publicKey.toString();
          break;
        }
        if (publicKey) {
          publicKeyStr = publicKey.toString();
          break;
        }
        if (windowProvider?.publicKey) {
          const pk = windowProvider.publicKey;
          if (typeof pk === 'string') {
            publicKeyStr = pk;
          } else if (pk.toString) {
            publicKeyStr = pk.toString();
          } else if (pk.toBase58) {
            publicKeyStr = pk.toBase58();
          }
          if (publicKeyStr) break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!publicKeyStr) {
        throw new Error('Connection succeeded but no public key received. Please try again.');
      }

      let provider: any = null;
      if (wallet.name === 'Phantom' && (window as any).solana?.isPhantom) {
        provider = (window as any).solana;
      } else if (wallet.name === 'Solflare' && (window as any).solflare) {
        provider = (window as any).solflare;
      }

      setConnectedWallet({
        provider,
        publicKey: publicKeyStr,
        walletName: wallet.name
      });
      setSelectedWallet(wallet);
      
      setIsCheckingWallet(true);
      try {
        const response = await api.users.getByWallet(publicKeyStr);
        if (response.success && response.data) {
          setExistingUser(response.data);
        } else {
          setExistingUser(null);
        }
      } catch (err) {
        setExistingUser(null);
      } finally {
        setIsCheckingWallet(false);
      }
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMessage = '';
      if (err?.code === 4001 || err?.message?.includes('User rejected') || err?.message?.includes('cancelled')) {
        errorMessage = 'Connection cancelled by user.';
      } else if (err?.message?.includes('not found') || err?.message?.includes('not available') || err?.message?.includes('not installed')) {
        errorMessage = `${wallet.name} wallet is not installed. Please install ${wallet.name} and refresh the page.`;
      } else if (err?.message?.includes('locked') || err?.message?.includes('unlock')) {
        errorMessage = 'Wallet is locked. Please unlock your wallet and try again.';
      } else if (err?.message) {
        errorMessage = err.message;
      } else {
        errorMessage = `Failed to connect to ${wallet.name}. Please make sure the wallet is installed and unlocked.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setSelectedWallet(null);
    setUsernameForWallet('');
    setExistingUser(null);
    setError('');
  };

  const handleWalletLogin = async () => {
    if (!connectedWallet) {
      setError('Please connect wallet');
      return;
    }

    const username = existingUser 
      ? existingUser.username 
      : (usernameForWallet || generateUsername(connectedWallet.publicKey));

    setIsLoading(true);
    setError('');

    try {
      const message = `Sign this message to authenticate with Instinct.fi\n\nWallet: ${connectedWallet.publicKey}\nUsername: ${username}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await connectedWallet.provider.signMessage(encodedMessage);
      
      let signatureBase58: string;
      if (signature instanceof Uint8Array) {
        signatureBase58 = bs58.encode(signature);
      } else if (signature && typeof signature === 'object' && signature.signature) {
        signatureBase58 = bs58.encode(signature.signature);
      } else if (Array.isArray(signature)) {
        signatureBase58 = bs58.encode(new Uint8Array(signature));
      } else if (signature && typeof signature === 'object') {
        const values = Object.values(signature);
        signatureBase58 = bs58.encode(new Uint8Array(values as number[]));
      } else {
        throw new Error(`Unsupported signature format: ${typeof signature}`);
      }

      await loginWithWallet(connectedWallet.publicKey, username, message, signatureBase58);
      onClose();
      setUsernameForWallet('');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Wallet authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await login('DemoWallet123', 'DemoUser');
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const installedWallets = availableWallets.filter(w => w.installed);
  const uninstalledWallets = availableWallets.filter(w => !w.installed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-50" />
      
      <div className="relative w-full max-w-md mx-4 animate-in slide-in-from-bottom-8 duration-500">
        <Panel className="p-8 border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-zinc-950 border border-indigo-500/30 rounded-full flex items-center justify-center">
                <Wallet size={32} className="text-indigo-500" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Connect to <span className="text-indigo-500">instinctfi.xyz</span>
            </h2>
            <p className="text-sm text-zinc-500 font-mono">
              Connect your Solana wallet or use mock login for demo
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded px-4 py-3">
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <span className="text-xs uppercase tracking-widest text-zinc-600 font-mono font-bold">
                1. Choose Your Wallet
              </span>
            </div>

            {connectedWallet ? (
              <div className="space-y-4">
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedWallet?.icon}</span>
                      <span className="text-white font-display">{selectedWallet?.name}</span>
                    </div>
                    <CheckCircle2 size={20} className="text-indigo-400" />
                  </div>
                  <p className="text-xs text-zinc-500 font-mono break-all">
                    {connectedWallet.publicKey.slice(0, 8)}...{connectedWallet.publicKey.slice(-8)}
                  </p>
                </div>

                {!existingUser && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-zinc-600 font-mono font-bold mb-2 block">
                      2. Choose Username
                    </label>
                    <input
                      type="text"
                      value={usernameForWallet}
                      onChange={(e) => setUsernameForWallet(e.target.value)}
                      placeholder={generateUsername(connectedWallet.publicKey)}
                      className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all font-mono"
                    />
                  </div>
                )}

                {existingUser && (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded px-4 py-3">
                    <p className="text-xs text-emerald-400 font-mono mb-1">Welcome back!</p>
                    <p className="text-xs text-zinc-500 font-mono">Username: {existingUser.username}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleWalletLogin}
                    disabled={isLoading || isCheckingWallet}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Sign & Login'
                    )}
                  </Button>
                  <Button
                    variant="neutral"
                    onClick={handleDisconnectWallet}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {installedWallets.length > 0 ? (
                  <div className="space-y-2">
                    {installedWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => handleConnectWallet(wallet)}
                        disabled={isLoading}
                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-indigo-500/30 rounded p-4 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <div className="text-left">
                            <div className="text-white font-display">{wallet.name}</div>
                            <div className="text-xs text-zinc-600 font-mono">Installed</div>
                          </div>
                        </div>
                        {isLoading && selectedWallet?.name === wallet.name && (
                          <Loader2 size={16} className="animate-spin text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-900/10 border border-amber-500/20 rounded px-4 py-3">
                    <p className="text-xs text-amber-400/90 font-mono mb-2 font-bold">
                      ⚠ No wallets detected
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Install a Solana wallet to continue:
                    </p>
                  </div>
                )}

                {uninstalledWallets.length > 0 && (
                  <div className="space-y-2">
                    {uninstalledWallets.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => window.open(wallet.url, '_blank')}
                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-purple-500/30 rounded p-4 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <span className="text-white font-display">Install {wallet.name}</span>
                        </div>
                        <ExternalLink size={16} className="text-zinc-600 group-hover:text-purple-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0a0a0a] px-4 text-zinc-600 font-mono tracking-widest">or</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full py-4 text-base"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <span className="font-display font-bold">Demo Login</span>
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-4">
            <div className="flex items-start gap-2">
              <Badge color="indigo" className="mt-0.5 shrink-0">DEVNET</Badge>
              <p className="text-xs text-zinc-500 font-mono leading-relaxed">
                This app uses Solana Devnet for testing. You'll need devnet SOL in your wallet for transactions.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};


