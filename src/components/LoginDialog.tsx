import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, User as UserIcon, Loader2, RotateCcw, ExternalLink } from 'lucide-react';
import bs58 from 'bs58';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameForWallet, setUsernameForWallet] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [formData, setFormData] = useState({
    walletAddress: '',
    username: '',
  });

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

  const handleConnectWallet = async (wallet: WalletInfo) => {
    try {
      setIsLoading(true);
      setError('');
      
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let provider;
      if (wallet.name === 'Phantom') {
        provider = (window as any).solana;
      } else if (wallet.name === 'Solflare') {
        provider = (window as any).solflare;
      } else if (wallet.name === 'Backpack') {
        provider = (window as any).backpack;
      } else if (wallet.name === 'Sollet') {
        provider = (window as any).sollet;
      }

      // For mobile, try to connect or redirect to wallet app
      if (isMobile && !provider) {
        // Try deep link to wallet app
        const deepLinks = {
          'Phantom': 'phantom://browse',
          'Solflare': 'solflare://browse',
          'Backpack': 'backpack://browse'
        };
        
        const deepLink = deepLinks[wallet.name as keyof typeof deepLinks];
        if (deepLink) {
          window.location.href = deepLink;
          setError(`Opening ${wallet.name} app... If it doesn't open, please install ${wallet.name} from the app store.`);
          setIsLoading(false);
          return;
        }
      }

      if (!provider) {
        throw new Error(`${wallet.name} wallet not found. Please install ${wallet.name} and refresh the page.`);
      }

      // Connect to wallet
      const response = await provider.connect();
      console.log('Wallet connection response:', response);
      
      // Handle different wallet response formats
      let publicKey: string;
      
      if (typeof response === 'string') {
        // Solflare might return string directly
        publicKey = response;
      } else if (response && response.publicKey) {
        // Most wallets return { publicKey: ... }
        if (typeof response.publicKey === 'string') {
          publicKey = response.publicKey;
        } else if (response.publicKey.toString) {
          publicKey = response.publicKey.toString();
        } else if (response.publicKey.toBase58) {
          publicKey = response.publicKey.toBase58();
        } else {
          throw new Error('Unsupported public key format');
        }
      } else if (provider.publicKey) {
        // Some wallets store publicKey on the provider itself
        if (typeof provider.publicKey === 'string') {
          publicKey = provider.publicKey;
        } else if (provider.publicKey.toString) {
          publicKey = provider.publicKey.toString();
        } else if (provider.publicKey.toBase58) {
          publicKey = provider.publicKey.toBase58();
        } else {
          throw new Error('Unsupported public key format');
        }
      } else {
        throw new Error('Unable to get public key from wallet');
      }
      
      console.log('Extracted public key:', publicKey);
      
      setConnectedWallet({
        provider,
        publicKey,
        walletName: wallet.name
      });
      setSelectedWallet(wallet);
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || `Failed to connect to ${wallet.name}. Please make sure ${wallet.name} is installed and unlocked.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setSelectedWallet(null);
    setUsernameForWallet('');
    setError('');
  };

  const handleWalletLogin = async () => {
    if (!connectedWallet || !usernameForWallet) {
      setError('Please connect wallet and enter username');
      return;
    }

    if (usernameForWallet.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create message to sign
      const message = `Sign this message to authenticate with Instinct.fi\n\nWallet: ${connectedWallet.publicKey}\nUsername: ${usernameForWallet}\nTimestamp: ${Date.now()}`;
      
      // Request signature from wallet
      const encodedMessage = new TextEncoder().encode(message);
      
      console.log('Requesting signature for message:', message);
      console.log('Encoded message:', encodedMessage);
      
      const signature = await connectedWallet.provider.signMessage(encodedMessage);
      
      console.log('Raw signature received:', signature);
      console.log('Signature type:', typeof signature);
      console.log('Signature constructor:', signature?.constructor?.name);
      
      // Handle different signature formats
      let signatureBase58: string;
      
      if (signature instanceof Uint8Array) {
        // Direct Uint8Array
        console.log('Signature is Uint8Array');
        signatureBase58 = bs58.encode(signature);
      } else if (signature && typeof signature === 'object' && signature.signature) {
        // Phantom returns { signature: Uint8Array }
        console.log('Signature has .signature property');
        signatureBase58 = bs58.encode(signature.signature);
      } else if (Array.isArray(signature)) {
        // Array format
        console.log('Signature is Array');
        signatureBase58 = bs58.encode(new Uint8Array(signature));
      } else if (signature && typeof signature === 'object') {
        // Try to convert object to Uint8Array
        console.log('Signature is object, converting...');
        const values = Object.values(signature);
        signatureBase58 = bs58.encode(new Uint8Array(values as number[]));
      } else {
        throw new Error(`Unsupported signature format: ${typeof signature}`);
      }

      console.log('Final encoded signature:', signatureBase58);

      // Call wallet login function
      await loginWithWallet(connectedWallet.publicKey, usernameForWallet, message, signatureBase58);
      
      // Close dialog on success
      onOpenChange(false);
      
      // Reset form
      setUsernameForWallet('');
      
      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Wallet authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                </div>
              )}

              {/* Username Input */}
              {connectedWallet && (
                <div className="space-y-2">
                  <Label htmlFor="walletUsername" className="text-foreground flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    2. Enter Username
                  </Label>
                  <Input
                    id="walletUsername"
                    type="text"
                    placeholder="Enter your username"
                    value={usernameForWallet}
                    onChange={(e) => setUsernameForWallet(e.target.value)}
                    disabled={isLoading}
                    className="bg-muted border-border focus:border-primary"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              {connectedWallet && (
                <Button
                  onClick={handleWalletLogin}
                  disabled={isLoading || !usernameForWallet}
                  className="w-full font-bold text-lg py-6 shadow-soft-md hover:shadow-soft-lg transition-all"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing Message...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Sign & Authenticate
                    </>
                  )}
                </Button>
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
