import React, { useCallback, useMemo } from 'react'
import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

import { LedgerWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter, } from '@solana/wallet-adapter-wallets';

import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

export const SolanaWalletAdapterContext = ({ children }) => {
    // The network can be set to 'localnet','devnet', 'testnet', or 'mainnet-beta'.
    const network = process.env.REACT_APP_CLUSTER;


    const endpoint = useMemo(() => {
        if (network === "localnet") {
            return 'http://localhost:8899';
        }
        return clusterApiUrl(network)
    }, [network]);



    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new LedgerWalletAdapter({}),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );


    const onError = useCallback(
        (error, adapter) => {
            console.error(error, adapter);
        },
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect >
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};