import { Connection } from '@solana/web3.js';
import { Provider } from '@project-serum/anchor';

const opts = {
    preflightCommitment: "processed"
}

async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    //TODO: the netwok connection must come from the wallet provider
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
        connection, wallet, opts.preflightCommitment,
    );
    return provider;
}

export function getSoalnaWalletProvider(){
    return getProvider();
}