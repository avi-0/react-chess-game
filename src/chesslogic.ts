import { Chess, SQUARES, Square } from "chess.js";
import { read, write } from "chessground/src/fen";
import { Color, File, Key, Piece, files, ranks } from "chessground/types";

export type Pieces = Map<Key, Piece>; // same as chessground
export type Moves = Map<Key, Key[]>;
export type ChessState = {
    pieces: Pieces,
    turnColor: Color,
    lastMove?: Key[],
    justCaptured?: boolean,
}
const knightOffsets: [number, number][] = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];
const rookOffsets: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function piecesFromFen(fen: string): Pieces  {
    return read(fen);
}

export function fenFromPieces(pieces: Pieces): string {
    return write(pieces)
}

// const standardFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const standardFen = "rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w KQkq - 0 1";
export const startingPosition: ChessState = {
    pieces: piecesFromFen(standardFen),
    turnColor: "white",
}

export function flipColor(color: Color) {
    return color == 'white' ? 'black' : 'white';
}

const xOfSquare: Map<Key, number> = new Map();
const yOfSquare: Map<Key, number> = new Map();
for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
        const file = files[x];
        const rank = ranks[y];
        
        const square: Key = `${file}${rank}`;
        xOfSquare.set(square, x);
        yOfSquare.set(square, y);
    }
}

function X(square: Square): number {
    return xOfSquare.get(square)!;
}

function Y(square: Square): number {
    return yOfSquare.get(square)!;
}

function XY(square: Square): [number, number] {
    return [X(square), Y(square)];
}

function squareAt(x: number, y: number): Square | undefined {
    if (x in files && y in ranks) {
        const file = files[x];
        const rank = ranks[y];
        
        return `${file}${rank}`;
    }
}

function squareOffset(square: Square, [offsetX, offsetY]: [number, number]): Square | undefined {
    const [x, y] = XY(square);
    return squareAt(x + offsetX, y + offsetY);
}

function squareOffsets(square: Square, offsets: [number, number][]): Square[] {
    return offsets.flatMap(offset => squareOffset(square, offset)).filter(square => square != undefined) as Square[];
}

function squareSightline(pieces: Pieces, square: Square, offset: [number, number]): Square[] {
    const [x, y] = XY(square);
    const sightline: Square[] = [];

    let currentSquare: Square | undefined = square;
    while (currentSquare != undefined) {
        sightline.push(currentSquare);

        currentSquare = squareOffset(currentSquare, offset);
    }

    return sightline;
}

function squareSightlines(pieces: Pieces, square: Square, offsets: [number, number][]): Square[] {
    return offsets.flatMap(offset => squareSightline(pieces, square, offset));
}

export function getMoves(state: ChessState): Moves {
    const moves: Moves = new Map();
    const captures = new Set();

    SQUARES.forEach(square => {
        const piece = state.pieces.get(square);

        if (piece) {
            let pieceMoves = SQUARES;

            if (piece.role == "knight") {
                pieceMoves = squareOffsets(square, knightOffsets);
            } else if (piece.role == "rook") {
                
                pieceMoves = squareSightlines(state.pieces, square, rookOffsets);
            }

            moves.set(square, pieceMoves);
        }

        
    })

    return moves;
}

export function getLegalMoves(state: ChessState): Moves  {
    // make a new Chess.js object to get legal moves for current position
    const chess: Chess | null = getChessJS(state);

    const moves: Moves = new Map();
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

    return moves;
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