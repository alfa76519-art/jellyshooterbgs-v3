export const JELLY_RAFFLE_ABI = [
    {
        type: 'function',
        name: 'buyTicket',
        constant: false,
        payable: true,
        inputs: [],
        outputs: [
            { name: 'ticketsBought', type: 'UINT256' },
            { name: 'lastTicketId', type: 'UINT256' },
        ],
    },
    {
        type: 'function',
        name: 'claimPrize',
        constant: false,
        payable: false,
        inputs: [],
        outputs: [
            { name: 'prizeAmount', type: 'UINT256' },
        ],
    },
    {
        type: 'function',
        name: 'getPlayerStats',
        constant: true,
        payable: false,
        inputs: [
            { name: 'player', type: 'ADDRESS' },
        ],
        outputs: [
            { name: 'ticketCount', type: 'UINT256' },
            { name: 'score', type: 'UINT256' },
        ],
    },
    {
        type: 'function',
        name: 'getRaffleInfo',
        constant: true,
        payable: false,
        inputs: [],
        outputs: [
            { name: 'ticketPrice', type: 'UINT256' },
            { name: 'totalTickets', type: 'UINT256' },
            { name: 'prizePool', type: 'UINT256' },
            { name: 'raffleActive', type: 'BOOL' },
            { name: 'currentRound', type: 'UINT64' },
            { name: 'winner', type: 'ADDRESS' },
        ],
    },
    {
        type: 'function',
        name: 'transfer',
        constant: false,
        payable: false,
        inputs: [
            { name: 'to', type: 'ADDRESS' },
            { name: 'amount', type: 'UINT256' },
        ],
        outputs: [
            { name: 'success', type: 'BOOL' },
        ],
    }
] as const;