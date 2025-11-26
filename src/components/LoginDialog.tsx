import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, User as UserIcon, Loader2, RotateCcw, ExternalLink, CheckCircle2 } from 'lucide-react';
import bs58 from 'bs58';
import { api } from '@/lib/api';
import { generateUsername } from '@/lib/usernameGenerator';
import { useWallet } from '@solana/wallet-adapter-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define wallet types
interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  installed: boolean;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, loginWithWallet } = useAuth();
  const navigate = useNavigate();
  const { publicKey, wallet: currentWallet, connect, disconnect, connected, connecting, wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameForWallet, setUsernameForWallet] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(false);
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);
  const [formData, setFormData] = useState({
    walletAddress: '',
    username: '',
  });
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);

  // Detect available wallets
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
        {
          name: 'Sollet',
          icon: '🔗',
          url: isMobile ? 'https://www.sollet.io/' : 'https://www.sollet.io/',
          installed: !!(window as any).sollet
        }
      ];

      // For mobile, show all wallets as "available" since detection doesn't work
      if (isMobile) {
        setAvailableWallets(wallets.map(wallet => ({ ...wallet, installed: true })));
      } else {
        setAvailableWallets(wallets.filter(wallet => wallet.installed));
      }
    };

    detectWallets();
    
    // Re-detect when window loads
    window.addEventListener('load', detectWallets);
    return () => window.removeEventListener('load', detectWallets);
  }, []);

  useEffect(() => {
    if (open) {
      setAutoLoginTriggered(false);
    }
  }, [open]);

  const handleConnectWallet = async (wallet: WalletInfo) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Find the wallet adapter from the context
      const walletAdapter = wallets.find(w => {
        const adapterName = w.adapter.name;
        return (wallet.name === 'Phantom' && adapterName === 'Phantom') ||
               (wallet.name === 'Solflare' && adapterName === 'Solflare');
      });

      if (!walletAdapter) {
        throw new Error(`${wallet.name} wallet adapter not found. Please refresh the page.`);
      }

      // Disconnect current wallet if connected to a different one
      if (connected && currentWallet && currentWallet.adapter.name !== walletAdapter.adapter.name) {
        try {
          await disconnect();
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (disconnectErr) {
          console.warn('Error disconnecting:', disconnectErr);
        }
      }

      // If already connected to the same wallet, use it
      if (connected && currentWallet && currentWallet.adapter.name === walletAdapter.adapter.name && publicKey) {
        const publicKeyStr = publicKey.toString();
        console.log('Already connected to', wallet.name, publicKeyStr);
        
        let provider: any = null;
        if (wallet.name === 'Phantom' && (window as any).solana?.isPhantom) {
          provider = (window as any).solana;
        } else if (wallet.name === 'Solflare' && (window as any).solflare) {
          provider = (window as any).solflare;
        }

        const alreadyConnectedWallet = {
          provider,
          publicKey: publicKeyStr,
          walletName: wallet.name
        };
        setConnectedWallet(alreadyConnectedWallet);
        setSelectedWallet(wallet);
        
        let cachedResponse: any = null;
        setIsCheckingWallet(true);
        try {
          cachedResponse = await api.users.getByWallet(publicKeyStr);
          if (cachedResponse.success && cachedResponse.data) {
            setExistingUser(cachedResponse.data);
          } else {
            setExistingUser(null);
          }
        } catch (err) {
          setExistingUser(null);
        } finally {
          setIsCheckingWallet(false);
        }
        
        if (!autoLoginTriggered) {
          setAutoLoginTriggered(true);
          await performWalletAuthentication(alreadyConnectedWallet, cachedResponse?.data ?? null);
        }
        
        setIsLoading(false);
        return;
      }

      // Connect using the wallet adapter from context
      console.log(`Connecting to ${wallet.name} via wallet adapter...`);
      
      // Check if wallet is installed by checking window provider directly (more reliable)
      let windowProvider: any = null;
      if (wallet.name === 'Phantom') {
        windowProvider = (window as any).solana;
        if (!windowProvider || !windowProvider.isPhantom) {
          throw new Error('Phantom wallet is not installed. Please install Phantom and refresh the page.');
        }
        // Wait a moment for Phantom to fully initialize
        await new Promise(resolve => setTimeout(resolve, 300));
      } else if (wallet.name === 'Solflare') {
        windowProvider = (window as any).solflare;
        if (!windowProvider) {
          throw new Error('Solflare wallet is not installed. Please install Solflare and refresh the page.');
        }
      }

      // Try connecting via adapter first (preferred method)
      let connectionSucceeded = false;
      try {
        console.log('Attempting connection via wallet adapter...');
        // Don't wait for ready state - just try to connect
        // The adapter will handle initialization internally
        await walletAdapter.adapter.connect();
        connectionSucceeded = true;
        console.log('Connection via adapter succeeded');
      } catch (adapterErr: any) {
        console.log('Adapter connect failed, trying direct provider...', adapterErr.message);
        
        // Fallback: Use direct provider connection if adapter fails
        if (windowProvider && typeof windowProvider.connect === 'function') {
          try {
            console.log('Attempting direct provider connection...');
            const response = await windowProvider.connect();
            connectionSucceeded = true;
            console.log('Direct provider connection succeeded', response);
          } catch (directErr: any) {
            console.error('Direct provider connect also failed:', directErr);
            // Throw the more descriptive error
            if (directErr.code === 4001 || directErr.message?.includes('User rejected')) {
              throw new Error('Connection cancelled by user.');
            }
            throw new Error(`Failed to connect: ${directErr.message || adapterErr.message}`);
          }
        } else {
          // If no window provider, throw adapter error
          throw adapterErr;
        }
      }

      // Wait for public key to be available
      // Check multiple sources: adapter, useWallet hook, and window provider
      let publicKeyStr: string | null = null;
      let attempts = 0;
      while (attempts < 30) {
        // Check adapter public key
        if (walletAdapter.adapter.publicKey) {
          publicKeyStr = walletAdapter.adapter.publicKey.toString();
          break;
        }
        // Check useWallet hook public key
        if (publicKey) {
          publicKeyStr = publicKey.toString();
          break;
        }
        // Check window provider public key (for direct connection)
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

      console.log('Connected wallet public key:', publicKeyStr);

      // Get the provider for signing messages later
      let provider: any = null;
      if (wallet.name === 'Phantom' && (window as any).solana?.isPhantom) {
        provider = (window as any).solana;
      } else if (wallet.name === 'Solflare' && (window as any).solflare) {
        provider = (window as any).solflare;
      }

      const newConnectedWallet = {
        provider,
        publicKey: publicKeyStr,
        walletName: wallet.name
      };
      setConnectedWallet(newConnectedWallet);
      setSelectedWallet(wallet);
      
      let cachedResponse: any = null;
      setIsCheckingWallet(true);
      try {
        cachedResponse = await api.users.getByWallet(publicKeyStr);
        if (cachedResponse.success && cachedResponse.data) {
          setExistingUser(cachedResponse.data);
          console.log('Welcome back user:', cachedResponse.data);
        } else {
          setExistingUser(null);
          console.log('New wallet detected, auto-generating username');
        }
      } catch (err) {
        console.log('Wallet not found in database, treating as new user');
        setExistingUser(null);
      } finally {
        setIsCheckingWallet(false);
      }
      
      if (!autoLoginTriggered) {
        setAutoLoginTriggered(true);
        setIsAutoAuthenticating(true);
        await performWalletAuthentication(newConnectedWallet, cachedResponse?.data ?? null);
        setIsAutoAuthenticating(false);
      }
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      
      // Provide helpful error messages
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

  const performWalletAuthentication = async (walletData: any, userData: any | null) => {
    if (!walletData) {
      setError('Please connect wallet');
      return;
    }

    const username = userData ? userData.username : generateUsername(walletData.publicKey);
    setIsLoading(true);
    setError('');

    try {
      const message = `Sign this message to authenticate with Instinct.fi\n\nWallet: ${walletData.publicKey}\nUsername: ${username}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await walletData.provider.signMessage(encodedMessage);

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

      await loginWithWallet(walletData.publicKey, username, message, signatureBase58);
      onOpenChange(false);
      setUsernameForWallet('');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Wallet login error:', err);
      setAutoLoginTriggered(false);
      setIsAutoAuthenticating(false);
      
      // Provide more helpful error messages
      let errorMessage = 'Wallet authentication failed. Please try again.';
      
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch') || err.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend is running.';
      } else if (err.message?.includes('User rejected') || err.message?.includes('cancelled')) {
        errorMessage = 'Signature request was cancelled. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    await performWalletAuthentication(connectedWallet, existingUser);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!formData.walletAddress || !formData.username) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Validate wallet address format (basic check)
      if (formData.walletAddress.length < 4) {
        setError('Please enter a valid wallet address');
        setIsLoading(false);
        return;
      }

      // Validate username
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        setIsLoading(false);
        return;
      }

      // Call login function
      await login(formData.walletAddress, formData.username);
      
      // Close dialog on success
      onOpenChange(false);
      
      // Reset form
      setFormData({ walletAddress: '', username: '' });
      
      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleQuickLogin = async (mockUser: { wallet: string; username: string }) => {
    setIsLoading(true);
    setError('');
    try {
      await login(mockUser.wallet, mockUser.username);
      onOpenChange(false);
      setFormData({ walletAddress: '', username: '' });
      
      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border shadow-soft-lg z-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Connect to Instinct.fi
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Solana wallet or use mock login for demo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wallet" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet">🔐 Solana Wallet</TabsTrigger>
            <TabsTrigger value="demo">🎮 Demo Login</TabsTrigger>
          </TabsList>

          {/* Solana Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4">
            <div className="space-y-4">
              {/* Available Wallets */}
              {!connectedWallet && (
                <div className="space-y-3">
                  <Label className="text-foreground">1. Choose Your Wallet</Label>
                  {availableWallets.length > 0 ? (
                    <div className="grid gap-2">
                      {availableWallets.map((wallet) => (
                        <Button
                          key={wallet.name}
                          variant="outline"
                          onClick={() => handleConnectWallet(wallet)}
                          disabled={isLoading}
                          className="w-full justify-start h-12"
                        >
                          <span className="text-2xl mr-3">{wallet.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{wallet.name}</div>
                            <div className="text-xs text-muted-foreground">Installed</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                        <div className="text-sm text-warning mb-2">No wallets detected</div>
                        <div className="text-xs text-muted-foreground mb-3">
                          Install a Solana wallet to continue:
                        </div>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://phantom.app/', '_blank')}
                            className="w-full justify-start"
                          >
                            <span className="text-lg mr-2">👻</span>
                            Install Phantom
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://solflare.com/', '_blank')}
                            className="w-full justify-start"
                          >
                            <span className="text-lg mr-2">☀️</span>
                            Install Solflare
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Connected Wallet Info */}
              {connectedWallet && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">Connected Wallet</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnectWallet}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{selectedWallet?.icon}</span>
                    <span className="font-semibold text-success">{connectedWallet.walletName}</span>
                  </div>
                  <div className="font-mono text-sm text-success break-all">
                    {connectedWallet.publicKey}
                  </div>
                  
                  {/* Checking wallet status */}
                  {isCheckingWallet && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking wallet...
                    </div>
                  )}
                  
                  {/* Existing user welcome message */}
                  {!isCheckingWallet && existingUser && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Welcome back, <span className="font-semibold">{existingUser.username}</span>!
                    </div>
                  )}
                  
                  {/* New wallet message */}
                  {!isCheckingWallet && !existingUser && !isAutoAuthenticating && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      New wallet detected - creating account...
                    </div>
                  )}
                </div>
              )}

              {/* Auto-authenticating state */}
              {connectedWallet && !isCheckingWallet && isAutoAuthenticating && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm font-semibold text-primary">Authenticating...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please sign the message in your wallet</p>
                </div>
              )}

              {/* Error Message */}
              {error && !isAutoAuthenticating && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3">
                  <div className="whitespace-pre-line">{error}</div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">
                  <strong className="text-primary">Devnet:</strong> This app uses Solana Devnet for testing.
                  You'll need devnet SOL in your wallet for transactions.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Demo Login Tab */}
          <TabsContent value="demo" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="walletAddress" className="text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </Label>
                <Input
                  id="walletAddress"
                  type="text"
                  placeholder="7xKz...9kL2"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  disabled={isLoading}
                  className="bg-muted border-border focus:border-primary"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="CryptoNinja"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                  className="bg-muted border-border focus:border-primary"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold text-lg py-6 shadow-soft-md hover:shadow-soft-lg transition-all"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Demo Login
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or quick login
                  </span>
                </div>
              </div>

              {/* Quick Login Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin({ wallet: '7xKz...9kL2', username: 'CryptoNinja' })}
                  disabled={isLoading}
                  className="w-full"
                >
                  🥷 Login as CryptoNinja
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin({ wallet: '8aB2...3mN4', username: 'SolanaKing' })}
                  disabled={isLoading}
                  className="w-full"
                >
                  👑 Login as SolanaKing
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin({ wallet: '9cD3...5oP6', username: 'DeFiQueen' })}
                  disabled={isLoading}
                  className="w-full"
                >
                  👸 Login as DeFiQueen
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
