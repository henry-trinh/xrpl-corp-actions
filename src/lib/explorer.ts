// src/lib/explorer.ts

// Helper function to generate a URL for the XRPL Testnet Explorer
export const txExplorerUrl = (hash?: string) =>
    hash ? `https://testnet.xrpl.org/transactions/${hash}` : "#";
  