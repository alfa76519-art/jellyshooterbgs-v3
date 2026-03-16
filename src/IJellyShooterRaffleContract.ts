import { Contract, CallResult } from 'opnet';

export interface RaffleInfoResult extends CallResult {
    properties: {
        ticketPrice: bigint;
        totalTickets: bigint;
        prizePool: bigint;
        raffleActive: boolean;
        currentRound: bigint;
        winner: string;
    };
}

export interface PlayerStatsResult extends CallResult {
    properties: {
        ticketCount: bigint;
        score: bigint;
    };
}


export interface IJellyShooterRaffleContract extends Contract {

    buyTicket(): Promise<any>;
    claimPrize(): Promise<any>;
    closeRaffle(winner: string): Promise<any>;
    setTicketPrice(price: bigint): Promise<any>;

    getPlayerStats(player: string): Promise<PlayerStatsResult>;
    getRaffleInfo(): Promise<RaffleInfoResult>;
}