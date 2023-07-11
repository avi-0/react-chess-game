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

export function getMoves(state: ChessState) {
    // make a new Chess.js object to get legal moves for current position
    const chess: Chess | null = getChessJS(state);

    const moves = new Map();
    const captures = new Set();

    if (chess) {
        SQUARES.forEach(s => {
            const ms = chess.moves({ square: s, verbose: true });

            if (ms.length) {
                moves.set(s, ms.map(m => m.to));

                ms.forEach(m => {
                    if (m.flags.includes('c')) {
                        captures.add(m.from + m.to);
                    }
                })
            }
        });
    }

    return { moves, captures };
}

function getChessJS(state: ChessState): Chess | null {
    let chess: Chess | null = new Chess();
    try {
        // simplified for now - assumes full castling rights and no en passants, they're not stored yet
        chess.load(makeSimpleFen(state));
    } catch {
        // chess.js errors on illegal positions, fuck it then
        chess = null;
    }

    return chess;
}

export function makeSimpleFen(state: ChessState) {
    return `${state.fen} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`
}