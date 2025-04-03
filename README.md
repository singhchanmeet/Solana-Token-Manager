# Solana Token Manager

A React application that allows users to interact with the Solana blockchain by creating, minting, and sending SPL tokens on the Solana devnet.

## Features

- **Wallet Integration**: Connect with Phantom, Solflare, or other Solana wallets
- **Token Creation**: Create your own SPL tokens on the Solana devnet
- **Token Minting**: Mint tokens to your own wallet or to other wallets
- **Token Sending**: Send tokens to other Solana wallets
- **Transaction History**: View your transaction history with links to the Solana Explorer
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Solana wallet browser extension (Phantom, Solflare, etc.)

## Installation

1. Clone the repository
```bash
git clone https://github.com/singhchanmeet/Solana-Token-Manager.git
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top right corner
2. Select your wallet provider (Phantom, Solflare, etc.)
3. Approve the connection in your wallet extension

### Creating a Token

1. Open the "Create New Token" panel
2. Enter a name for your token
3. Enter a symbol for your token
4. Select the number of decimal places (0-9)
5. Click "Create Token"
6. Approve the transaction in your wallet extension

### Minting Tokens

1. Open the "Mint Tokens" panel
2. Select the token you want to mint from the dropdown
3. Enter the amount to mint
4. Optionally check "Mint to a different wallet" and enter the destination address
5. Click "Mint Tokens"
6. Approve the transaction in your wallet extension

### Sending Tokens

1. Open the "Send Tokens" panel
2. Select the token you want to send from the dropdown
3. Enter the amount to send
4. Enter the receiver's wallet address
5. Click "Send Tokens"
6. Approve the transaction in your wallet extension

## Important Notes

- This application works on the Solana devnet, not the mainnet
- You need SOL tokens on the devnet to pay for transaction fees
- You can get devnet SOL from the [Solana Faucet](https://faucet.solana.com/)
- Only the mint authority can mint new tokens
- Make sure the receiver's wallet address is correct before sending tokens

## Technical Details

This application uses:

- React for the UI
- @solana/web3.js for Solana blockchain interactions
- @solana/spl-token for SPL token program interactions
- @solana/wallet-adapter libraries for wallet connections

## Acknowledgements

- Solana Foundation
- SPL Token Program
- Wallet Adapter Libraries