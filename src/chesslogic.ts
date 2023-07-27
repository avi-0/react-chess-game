import { move } from "chessground/drag";
import { read, write } from "chessground/src/fen";
import { Color, Key, Piece, files, ranks } from "chessground/types";

export type Square = Key;
export type Pieces = Map<Square, Piece>; // same as chessground
export type EnPassant = {
    passedSquare: Square;
    pawnSquare: Square;
}
export type ChessState = {
    pieces: Pieces,
    turnColor: Color,
    lastMove?: Square[],
    justCaptured?: boolean,
    enPassant?: EnPassant,
}
export type Move = {
    from: Square,
    to: Square,
    result: ChessState,
}
export type Moves = Map<Square, Move[]>;

const knightOffsets: [number, number][] = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];
const rookOffsets: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const bishopOffsets: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
const queenOffsets: [number, number][] = rookOffsets.concat(bishopOffsets);

export function piecesFromFen(fen: string): Pieces {
    return read(fen);
}

export function fenFromPieces(pieces: Pieces): string {
    return write(pieces)
}

const standardFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const startingPosition: ChessState = {
    pieces: piecesFromFen(standardFen),
    turnColor: "white",
}

export function flipColor(color: Color): Color {
    return color == 'white' ? 'black' : 'white';
}

const SQUARES: Square[] = new Array();
const X_OF_SQUARE: Map<Square, number> = new Map();
const Y_OF_SQUARE: Map<Square, number> = new Map();
for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
        const file = files[x];
        const rank = ranks[y];

        const square: Square = `${file}${rank}`;
        SQUARES.push(square);
        X_OF_SQUARE.set(square, x);
        Y_OF_SQUARE.set(square, y);
    }
}

function X(square: Square): number {
    return X_OF_SQUARE.get(square)!;
}

function Y(square: Square): number {
    return Y_OF_SQUARE.get(square)!;
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

function updatedMap<K, V>(map: Map<K, V>, updateFn: (map: Map<K, V>) => void) {
    const newMap = new Map(map);

    updateFn(newMap);

    return newMap;
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
    const color = pieces.get(square)?.color;
    const sightline: Square[] = [];

    let currentSquare: Square | undefined = square;
    while (currentSquare != undefined) {
        sightline.push(currentSquare);

        // stop after hitting any piece
        if (currentSquare != square && pieces.get(currentSquare)) {
            break;
        }

        currentSquare = squareOffset(currentSquare, offset);
    }

    return sightline;
}

function squareSightlines(pieces: Pieces, square: Square, offsets: [number, number][]): Square[] {
    return offsets.flatMap(offset => squareSightline(pieces, square, offset));
}

export function getMovesAnyPlayer(state: ChessState): Moves {
    const pieces = state.pieces;

    const moves: Moves = new Map();
    SQUARES.forEach(from => {
        const pieceMoves = squareMoves(state, from);
        moves.set(from, pieceMoves);
    })

    return moves;
}

function movePiece(state: ChessState, from: Square, to: Square): Move {
    const result = {
        ...state,
        pieces: updatedMap(state.pieces, (pieces) => {
            const piece = pieces.get(from);

            if (piece) {
                pieces.set(to, piece);
                pieces.delete(from);
            }
        }),
        turnColor: flipColor(state.turnColor),
        justCaptured: state.pieces.get(to) != undefined,
    }

    return {
        from: from,
        to: to,
        result: result
    }
}

function getKingTargets(state: ChessState, from: Square): Square[] {
    return squareOffsets(from, queenOffsets);
}

function getKnightTargets(state: ChessState, from: Square): Square[] {
    return squareOffsets(from, knightOffsets);
}

function getRookTargets(state: ChessState, from: Square): Square[] {
    return squareSightlines(state.pieces, from, rookOffsets);
}

function getBishopTargets(state: ChessState, from: Square): Square[] {
    return squareSightlines(state.pieces, from, bishopOffsets);
}

function getQueenTargets(state: ChessState, from: Square): Square[] {
    return squareSightlines(state.pieces, from, queenOffsets);
}

function getPawnPushes(state: ChessState, from: Square, color: Color): Square[] {
    const [x, y] = XY(from);

    const push: [number, number] = color == "white" ? [0, 1] : [0, -1];
    const doublePush: [number, number] = color == "white" ? [0, 2] : [0, -2];
    const canDoublePush = color == "white" ? y == 1 : y == 6;

    const offsets = [push];
    if (canDoublePush) {
        offsets.push(doublePush);
    }

    return squareOffsets(from, offsets);
}

function getPawnCaptures(state: ChessState, from: Square, color: Color): Square[] {
    const offsets: [number, number][] = color == "white" ? [[-1, 1], [1, 1]] : [[-1, -1], [1, -1]];

    return squareOffsets(from, offsets);
}

function getPawnTargets(state: ChessState, from: Square, color: Color): Square[] {
    return getPawnPushes(state, from, color).concat(getPawnCaptures(state, from, color));
}

function getPieceTargets(piece: Piece, state: ChessState, from: Square): Square[] {
    if (piece.role == "king") {
        return getKingTargets(state, from);
    } else if (piece.role == "knight") {
        return getKnightTargets(state, from);
    } else if (piece.role == "rook") {
        return getRookTargets(state, from);
    } else if (piece.role == "bishop") {
        return getBishopTargets(state, from);
    } else if (piece.role == "queen") {
        return getQueenTargets(state, from);
    } else if (piece.role == "pawn") {
        return getPawnTargets(state, from, piece.color);
    }

    return [];
}

function squareMoves(state: ChessState, from: Square): Move[] {
    const pieces = state.pieces;

    const piece = pieces.get(from);
    if (piece == undefined) return [];

    return getPieceTargets(piece, state, from)
        .map((to) => {
            return movePiece(state, from, to);
        })
}

export function getMoves(state: ChessState): Moves {
    const moves = getMovesAnyPlayer(state);

    // filter out the other player
    for (const square of moves.keys()) {
        if (state.pieces.get(square)?.color != state.turnColor) {
            moves.delete(square);
        }
    }

    return moves;
}

export function getTelepathyMoves(state: ChessState): Moves {
    const moves = getMovesAnyPlayer(state);

    const targets = [];
    for (const moveArray of moves.values()) {
        for (const move of moveArray) {
            if (state.pieces.get(move.from)?.color == state.turnColor && move.result.justCaptured) {
                targets.push(move.to);
            }
        }
    }

    // now filter out to only keep the moves we want from other player
    for (const square of moves.keys()) {
        if (!targets.includes(square)) {
            moves.delete(square);
        }
    }

    return moves;
}