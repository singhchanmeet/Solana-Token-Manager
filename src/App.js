import React, { useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { 
  clusterApiUrl, 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  Keypair,
  SystemProgram
} from '@solana/web3.js';
import { 
  createMint, 
  getMint, 
  getAccount, 
  createAccount, 
  mintTo, 
  getOrCreateAssociatedTokenAccount, 
  transfer,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  AccountLayout
} from '@solana/spl-token';
import './App.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Components
import WalletInfo from './components/WalletInfo';
import TokenCreator from './components/TokenCreator';
import TokenMinter from './components/TokenMinter';
import TokenSender from './components/TokenSender';
import TransactionHistory from './components/TransactionHistory';
import Notification from './components/Notification';

function App() {
  // You can also provide a custom RPC endpoint
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // Add wallet adapters you wish to support
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app">
            <header className="app-header">
              <h1>Solana Token Creator</h1>
              <WalletMultiButton />
            </header>
            <div className="app-content">
              <SolanaApp />
            </div>
            <footer className="app-footer">
              <p>Solana Token Creator - Devnet</p>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function SolanaApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [solBalance, setSolBalance] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchSolBalance();
      fetchTokens();
    }
  }, [wallet.publicKey, connection]);

  // Fetch transaction history from the blockchain
  const fetchTransactionHistory = async () => {
    if (!wallet.publicKey) return;
    
    setIsLoading(true);
    try {
      // Get the signatures for all transactions involving the wallet
      const signatures = await connection.getSignaturesForAddress(
        wallet.publicKey,
        { limit: 20 }, // You can adjust the limit as needed
        'confirmed'
      );
      
      console.log("Found signatures:", signatures.length);
      
      if (signatures.length === 0) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch the transaction details for each signature
      const transactionDetails = await Promise.all(
        signatures.map(async (signatureInfo) => {
          try {
            const { signature, slot, err, memo } = signatureInfo;
            
            // Get the parsed transaction data
            const tx = await connection.getParsedTransaction(signature, 'confirmed');
            
            if (!tx) {
              return null;
            }
            
            // Try to determine transaction type and details
            let type = 'Unknown';
            let details = memo || '';
            
            // Check if this is an SPL token transaction
            if (tx.meta && tx.transaction.message.instructions) {
              const instructions = tx.transaction.message.instructions;
              
              // Try to determine the type of token transaction
              for (const ix of instructions) {
                if (ix.program === 'spl-token') {
                  // This is a token program instruction
                  if (ix.parsed && ix.parsed.type) {
                    type = ix.parsed.type;
                    
                    // For token creation
                    if (type === 'initializeMint') {
                      details = `Created token mint: ${ix.parsed.info.mint}`;
                    }
                    // For token minting
                    else if (type === 'mintTo') {
                      const { amount, mint, mintAuthority, account } = ix.parsed.info;
                      details = `Minted ${Number(amount) / Math.pow(10, 9)} tokens to ${account}`;
                    }
                    // For token transfers
                    else if (type === 'transfer') {
                      const { amount, authority, destination, source } = ix.parsed.info;
                      details = `Transferred ${Number(amount) / Math.pow(10, 9)} tokens from ${source} to ${destination}`;
                    }
                  }
                } else {
                  // For account creation
                  if (ix.parsed && ix.parsed.type) {
                    type = ix.parsed.type;
                    if (type === 'createAccount') {
                      const { lamports, newAccount, owner,source ,space } = ix.parsed.info;
                      details = `Created account ${newAccount}`;
                    }
                  }
                }
              }
            }
            
            return {
              id: signature,
              signature,
              timestamp: new Date(signatureInfo.blockTime * 1000).toLocaleString(),
              status: err ? 'Failed' : 'Success',
              type,
              details
            };
          } catch (error) {
            console.error(`Error fetching transaction ${signatureInfo.signature}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any transactions that couldn't be fetched
      const validTransactions = transactionDetails.filter(tx => tx !== null);
      
      // Sort transactions by timestamp (newest first)
      validTransactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setTransactions(validTransactions);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      showNotification('error', `Failed to fetch transaction history: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const fetchSolBalance = async () => {
    if (!wallet.publicKey || !connection) return;
    
    try {
      console.log("Fetching SOL balance for:", wallet.publicKey.toString());
      const balance = await connection.getBalance(wallet.publicKey);
      console.log("SOL balance (lamports):", balance);
      setSolBalance(balance / 1000000000); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      showNotification('error', 'Failed to fetch SOL balance');
    }
  };

  const fetchTokens = async () => {
    try {
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        wallet.publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      console.log(`Found ${tokenAccounts.value.length} token accounts`);
      
      const tokenData = await Promise.all(
        tokenAccounts.value.map(async (tokenAccount) => {
          try {
            // Parse the account data
            const accountInfo = tokenAccount.account;
            const accountData = AccountLayout.decode(accountInfo.data);
            
            // Get the mint address from the account data
            const mintAddress = new PublicKey(accountData.mint);
            
            // Get the token amount
            const amount = accountData.amount;
            
            try {
              // Try to get the mint info for decimals
              const mintInfo = await getMint(connection, mintAddress);
              return {
                mint: mintAddress.toString(),
                balance: Number(amount) / Math.pow(10, mintInfo.decimals),
                decimals: mintInfo.decimals,
                tokenAccount: tokenAccount.pubkey.toString()
              };
            } catch (e) {
              console.warn(`Error getting mint info for ${mintAddress.toString()}:`, e);
              // Fallback to displaying raw amount if we can't get decimal info
              return {
                mint: mintAddress.toString(),
                balance: Number(amount),
                decimals: 0,
                tokenAccount: tokenAccount.pubkey.toString()
              };
            }
          } catch (e) {
            console.warn("Error parsing token account:", e);
            return null;
          }
        })
      );
      
      // Filter out any failed parsings
      const validTokenData = tokenData.filter(data => data !== null);
      console.log("Token data:", validTokenData);
      
      setTokens(validTokenData);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showNotification('error', `Failed to fetch tokens: ${error.message}`);
    }
  };

  const createToken = async (name, symbol, decimals) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      showNotification('error', 'Please connect your wallet with signing capabilities');
      return;
    }

    setIsLoading(true);
    try {
      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate();
      console.log("Created mint keypair:", mintKeypair.publicKey.toString());
      
      // Calculate the required space and lamports (rent) for the mint account
      const lamports = await connection.getMinimumBalanceForRentExemption(82);
      
      // Create a transaction to create an account for the mint
      const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82, // Size needed for mint account
          lamports,
          programId: TOKEN_PROGRAM_ID
        })
      );
      
      // Create a transaction to initialize the mint
      const initMintTransaction = new Transaction().add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      );
      
      // Sign and send the create account transaction
      createAccountTransaction.feePayer = wallet.publicKey;
      createAccountTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      
      // The wallet adapter will handle signing with the user's wallet
      const signedCreateAccountTx = await wallet.signTransaction(createAccountTransaction);
      
      // We also need to sign with the mint keypair
      signedCreateAccountTx.partialSign(mintKeypair);
      
      const createAccountTxId = await connection.sendRawTransaction(
        signedCreateAccountTx.serialize()
      );
      
      // Wait for confirmation of the first transaction
      await connection.confirmTransaction(createAccountTxId);
      
      // Now initialize the mint
      initMintTransaction.feePayer = wallet.publicKey;
      initMintTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      
      const signedInitMintTx = await wallet.signTransaction(initMintTransaction);
      
      const initMintTxId = await connection.sendRawTransaction(
        signedInitMintTx.serialize()
      );
      
      await connection.confirmTransaction(initMintTxId);
      
      // Save information about this mint
      const mintAddress = mintKeypair.publicKey.toString();
      
      showNotification('success', `Successfully created token: ${mintAddress}`);
      
      // Refresh balances and transaction history
      fetchSolBalance();
      fetchTokens();
      
      // Give the blockchain a moment to process before fetching history
      setTimeout(() => {
        fetchTransactionHistory();
      }, 2000);
    } catch (error) {
      console.error('Error creating token:', error);
      showNotification('error', `Failed to create token: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const mintToken = async (mintAddress, amount, destinationAddress) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      showNotification('error', 'Please connect your wallet with signing capabilities');
      return;
    }

    setIsLoading(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const destination = destinationAddress 
        ? new PublicKey(destinationAddress) 
        : wallet.publicKey;

      // Get mint info to determine the decimals
      const mintInfo = await getMint(connection, mintPublicKey);
      
      // Let's try to check if the token account exists first
      console.log("Creating associated token account for mint:", mintPublicKey.toString());
      console.log("Destination account:", destination.toString());
      
      // Create or get the associated token account for the destination
      // We need to make sure we're doing this correctly, so let's use a more deliberate approach
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        destination
      );
      
      console.log("Associated token address:", associatedTokenAddress.toString());
      
      // Check if the associated token account exists
      let tokenAccount;
      try {
        tokenAccount = await getAccount(connection, associatedTokenAddress);
        console.log("Token account exists:", tokenAccount.address.toString());
      } catch (error) {
        if (error.name === 'TokenAccountNotFoundError') {
          console.log("Token account does not exist, creating it...");
          // Create a transaction to create the associated token account
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey, // payer
              associatedTokenAddress, // associated token account
              destination, // owner
              mintPublicKey, // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
          
          transaction.feePayer = wallet.publicKey;
          transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
          
          const signedTransaction = await wallet.signTransaction(transaction);
          const txid = await connection.sendRawTransaction(signedTransaction.serialize());
          await connection.confirmTransaction(txid);
          
          // Now get the created account
          tokenAccount = await getAccount(connection, associatedTokenAddress);
          console.log("Created token account:", tokenAccount.address.toString());
        } else {
          throw error;  // If it's another error, rethrow it
        }
      }

      // Calculate the amount with proper decimals
      const mintAmount = Math.floor(amount * Math.pow(10, mintInfo.decimals));
      
      // Create a mint instruction
      const mintTransaction = new Transaction().add(
        createMintToInstruction(
          mintPublicKey,
          tokenAccount.address,
          wallet.publicKey,
          mintAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // Set the fee payer and recent blockhash
      mintTransaction.feePayer = wallet.publicKey;
      mintTransaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      
      // Sign the transaction with the user's wallet
      const signedMintTransaction = await wallet.signTransaction(mintTransaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedMintTransaction.serialize()
      );
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      showNotification('success', `Successfully minted ${amount} tokens`);
      
      // Refresh balances and transaction history
      fetchSolBalance();
      fetchTokens();
      
      // Give the blockchain a moment to process before fetching history
      setTimeout(() => {
        fetchTransactionHistory();
      }, 2000);
    } catch (error) {
      console.error('Error minting token:', error);
      showNotification('error', `Failed to mint token: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToken = async (mintAddress, amount, receiverAddress) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      showNotification('error', 'Please connect your wallet with signing capabilities');
      return;
    }

    setIsLoading(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const receiverPublicKey = new PublicKey(receiverAddress);

      // Get mint info to determine the decimals
      const mintInfo = await getMint(connection, mintPublicKey);
      
      // Get or create the source token account (yours)
      const sourceTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        wallet.publicKey
      );
      
      // Ensure source token account exists
      let sourceAccount;
      try {
        sourceAccount = await getAccount(connection, sourceTokenAddress);
      } catch (error) {
        if (error.name === 'TokenAccountNotFoundError') {
          throw new Error(`You don't have a token account for this token. Please mint some tokens first.`);
        } else {
          throw error;
        }
      }
      
      // Get or create the destination token account
      const destinationTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        receiverPublicKey
      );
      
      // Check if the destination token account exists, create it if it doesn't
      let destinationAccount;
      try {
        destinationAccount = await getAccount(connection, destinationTokenAddress);
      } catch (error) {
        if (error.name === 'TokenAccountNotFoundError') {
          console.log("Destination token account does not exist, creating it...");
          // Create a transaction to create the associated token account
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey, // payer
              destinationTokenAddress, // associated token account
              receiverPublicKey, // owner
              mintPublicKey, // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
          
          transaction.feePayer = wallet.publicKey;
          transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
          
          const signedTransaction = await wallet.signTransaction(transaction);
          const txid = await connection.sendRawTransaction(signedTransaction.serialize());
          await connection.confirmTransaction(txid);
          
          // Now get the created account
          destinationAccount = await getAccount(connection, destinationTokenAddress);
        } else {
          throw error;
        }
      }

      // Calculate the amount with proper decimals
      const transferAmount = Math.floor(amount * Math.pow(10, mintInfo.decimals));
      
      // Check if the source account has enough tokens
      // if (BigInt(sourceAccount.amount) < BigInt(transferAmount)) {
      //   throw new Error(`Insufficient token balance. You have ${Number(sourceAccount.amount) / Math.pow(10, mintInfo.decimals)} tokens.`);
      // }
      
      // Create a transfer instruction
      const transaction = new Transaction().add(
        createTransferInstruction(
          sourceTokenAddress,
          destinationTokenAddress,
          wallet.publicKey,
          transferAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // Set the fee payer and recent blockhash
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      
      // Sign the transaction with the user's wallet
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);

      showNotification('success', `Successfully sent ${amount} tokens to ${receiverAddress}`);
      
      // Refresh balances and transaction history
      fetchSolBalance();
      fetchTokens();
      
      // Give the blockchain a moment to process before fetching history
      setTimeout(() => {
        fetchTransactionHistory();
      }, 2000);
    } catch (error) {
      console.error('Error sending token:', error);
      showNotification('error', `Failed to send token: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="connect-wallet-container">
        <h2>Connect your Solana wallet to get started</h2>
        <p>This app allows you to create, mint, and send tokens on Solana's devnet</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="solana-app">
      {notification.show && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification({ show: false, type: '', message: '' })} 
        />
      )}

      <WalletInfo 
        publicKey={wallet.publicKey.toString()} 
        solBalance={solBalance} 
        tokens={tokens} 
      />

      <div className="actions-container">
        <TokenCreator 
          createToken={createToken} 
          isLoading={isLoading} 
        />
        
        <TokenMinter 
          mintToken={mintToken} 
          tokens={tokens} 
          isLoading={isLoading} 
        />
        
        <TokenSender 
          sendToken={sendToken} 
          tokens={tokens} 
          isLoading={isLoading} 
        />
      </div>

      <TransactionHistory 
        transactions={transactions} 
        refreshTransactions={fetchTransactionHistory}
        isLoading={isLoading} 
      />
    </div>
  );
}

export default App;