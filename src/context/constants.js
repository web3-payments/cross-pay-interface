import { ENV as ENVChainId } from "@solana/spl-token-registry";

require('dotenv').config()

// Endpoints, connection
export const ENV = (process.env.REACT_APP_CLUSTER) || "mainnet-beta";
export const CHAIN_ID = ENV === 'mainnet-beta'
    ? ENVChainId.MainnetBeta
    : ENV === 'devnet'
        ? ENVChainId.Devnet
        : ENV === 'testnet'
            ? ENVChainId.Testnet
            : ENVChainId.MainnetBeta
export const SOLANA_RPC_ENDPOINT = ENV === "devnet"
    ? 'https://api.devnet.solana.com'
    : "https://solana-api.projectserum.com";

// Token Mints
export const INPUT_MINT_ADDRESS =
    ENV === "devnet"
        ? "So11111111111111111111111111111111111111112" // SOL
        : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
export const OUTPUT_MINT_ADDRESS = ENV === "devnet"
    ? "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" // SRM
    : "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT
