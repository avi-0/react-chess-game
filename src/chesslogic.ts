import { Chess, SQUARES } from "chess.js";
import { read, write } from "chessground/src/fen";
import { Color, Key, Piece } from "chessground/types";

export type Pieces = Map<Key, Piece>; // same as chessground

export type ChessState = {
    pieces: Pieces,
    turnColor: Color,
    lastMove?: Key[],
}

export function piecesFromFen(fen: string): Pieces  {
    return read(fen);
}

export function fenFromPieces(pieces: Pieces): string {
    return write(pieces)
}

export const startingPosition: ChessState = {
    pieces: piecesFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"),
    turnColor: "white",
}

export function flipColor(color: Color) {
    return color == 'white' ? 'black' : 'white';
}

export function getLegalMoves(state: ChessState) {
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

export function getMoves(state: ChessState) {
    const moves: Map<Key, Key[]> = new Map();
    const captures = new Set();

    SQUARES.forEach(square => {
        moves.set(square, SQUARES);
    })

    return { moves, captures }
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
    return `${fenFromPieces(state.pieces)} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`
}