import { Chess, SQUARES } from "chess.js";
import { Color, Key } from "chessground/types";

export type ChessState = {
    fen: string,
    turnColor: Color,
    lastMove?: Key[],
}

export const startingPosition: ChessState = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    turnColor: "white",
}

export function flipColor(color: Color) {
    return color == 'white' ? 'black' : 'white';
}

export function getMoves(chess?: Chess) {
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

export function makeSimpleFen(state: ChessState) {
    return `${state.fen} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`
}