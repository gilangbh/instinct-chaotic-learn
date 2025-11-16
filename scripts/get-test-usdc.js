#!/usr/bin/env node

/**
 * Mint test USDC to a wallet address on devnet
 * 
 * Usage: node scripts/get-test-usdc.js <WALLET_ADDRESS> <AMOUNT>
 * Example: node scripts/get-test-usdc.js 2f2Gz...cfn 100
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const USDC_MINT = '4S3JAFSr7HZg4T8WFPPhXs2HsSz8TyEhEyURVQUxHE5Y';

// Mint authority keypair (should match the one used to create the mint)
// This should be your backend's SOLANA_PRIVATE_KEY
const MINT_AUTHORITY_KEY = process.env.SOLANA_PRIVATE_KEY;

async function mintTestUsdc() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: node scripts/get-test-usdc.js <WALLET_ADDRESS> <AMOUNT>');
    console.log('Example: node scripts/get-test-usdc.js 2f2GzFzxrvqQ2E8pAt7EVwq6YWcuZqegA5HBge7qiCfn 100');
    process.exit(1);
  }

  const recipientAddress = args[0];
  const amount = parseFloat(args[1]);

  if (isNaN(amount) || amount <= 0) {
    console.log('❌ Amount must be a positive number');
    process.exit(1);
  }

  console.log('\n💰 Minting Test USDC on Devnet');
  console.log('═'.repeat(50));
  console.log(`Recipient: ${recipientAddress}`);
  console.log(`Amount: ${amount} USDC`);
  console.log('═'.repeat(50) + '\n');

  try {
    // Connect to devnet
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log('✓ Connected to Solana devnet');

    // Parse mint authority
    if (!MINT_AUTHORITY_KEY) {
      console.log('❌ SOLANA_PRIVATE_KEY not found in environment');
      console.log('   Please set it in .env file or export it:');
      console.log('   export SOLANA_PRIVATE_KEY="[...]"');
      process.exit(1);
    }

    const mintAuthData = JSON.parse(MINT_AUTHORITY_KEY);
    const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(mintAuthData));
    console.log('✓ Mint authority:', mintAuthority.publicKey.toString());

    // Parse recipient
    const recipient = new PublicKey(recipientAddress);
    const usdcMint = new PublicKey(USDC_MINT);
    console.log('✓ USDC Mint:', usdcMint.toString());

    // Get or create recipient's token account
    console.log('\n⏳ Getting/creating token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // Payer
      usdcMint,
      recipient
    );
    console.log('✓ Token account:', recipientTokenAccount.address.toString());

    // Mint tokens
    console.log(`\n⏳ Minting ${amount} USDC...`);
    const signature = await mintTo(
      connection,
      mintAuthority, // Payer
      usdcMint,
      recipientTokenAccount.address,
      mintAuthority, // Mint authority
      amount * 1_000_000, // Convert to smallest unit (6 decimals)
    );

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Successfully minted test USDC!');
    console.log('═'.repeat(50));
    console.log(`Amount: ${amount} USDC`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Token Account: ${recipientTokenAccount.address.toString()}`);
    console.log(`Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log('\n🎉 You can now deposit USDC on the frontend!\n');

  } catch (error) {
    console.error('\n❌ Failed to mint test USDC:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure SOLANA_PRIVATE_KEY is set and is the mint authority');
    console.error('2. Ensure you have SOL for transaction fees');
    console.error('3. Verify the USDC mint address is correct');
    process.exit(1);
  }
}

mintTestUsdc();











