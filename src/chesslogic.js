import { SQUARES } from "chess.js";

export function flipColor(color) {
    return color == 'white' ? 'black' : 'white';
}

export function getMoves(chess) {
    const dests = new Map();
    const captures = new Set();

    if (chess) {
        SQUARES.forEach(s => {
            const ms = chess.moves({ square: s, verbose: true });

            if (ms.length) {
                dests.set(s, ms.map(m => m.to));

                ms.forEach(m => {
                    if (m.flags.includes('c')) {
                        captures.add(m.from + m.to);
                    }
                })
            }
        });
    }

    return { dests, captures };
}

export function makePermissiveFen(state) {
    return `${state.fen} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`
}