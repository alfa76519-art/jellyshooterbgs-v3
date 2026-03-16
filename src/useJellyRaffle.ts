import { useState, useCallback } from 'react';
import { getContract, TransactionParameters } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';
import { JELLY_RAFFLE_ABI } from './JellyShooterRaffle.abi';

const PILL_ADDR = 'opt1sqp5gx9k0nrqph3sy3aeyzt673dz7ygtqxcfdqfle';
const BRANKAS_ADDR = 'opt1pfd8fcd8a28qre7gnrlyak6zjwqutkvdsfn9sr64jwqd0wn8rxnsvxrxvd';

export function useJellyRaffle(walletAddress?: string) {
    const [loading, setLoading] = useState(false);

    const buyTicket = useCallback(async (amountSatoshi: bigint) => {
        setLoading(true);
        try {
            const opnet = (window as any).opnet;

            const tx = await opnet.request({
                method: 'transfer',
                params: {
                    to: 'opt1pfd8fcd8a28qre7gnrlyak6zjwqutkvdsfn9sr64jwqd0wn8rxnsvxrxvd',
                    amount: amountSatoshi.toString(), // Paksa jadi string biar aman
                    tokenAddress: 'opt1sqp5gx9k0nrqph3sy3aeyzt673dz7ygtqxcfdqfle',
                    publicKey: undefined // Tetap jaga-jaga buat ML-DSA
                }
            });

            console.log('✅ JEBOL:', tx);
            alert("CHING! TXID: " + tx);
            return tx;
        } catch (e: any) {
            console.error('❌ Gagal:', e);
            alert("ALERT!");
        } finally {
            setLoading(false);
        }
    }, []);

    return { buyTicket, loading };
}