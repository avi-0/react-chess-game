import { read, write } from "chessground/src/fen";
import { Color, Key as Square, Piece, files, ranks } from "chessground/types";

export type Pieces = Map<Square, Piece>; // same as chessground
export type EnPassant = {
    passedSquare: Square;
    pawnSquare: Square;
}
export type Move = {
    from: Square,
    to: Square,
    isCapture?: boolean,
    allowsEnPassant?: EnPassant,
    isEnPassant?: EnPassant,
}
export type Moves = Map<Square, Move[]>;
export type ChessState = {
    pieces: Pieces,
    turnColor: Color,
    lastMove?: Square[],
    justCaptured?: boolean,
    enPassant?: EnPassant,
}
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
    const captures = new Set();

    SQUARES.forEach(square => {
        const piece = state.pieces.get(square);

        if (piece) {
            let pieceMoveSquares = SQUARES;

            // remember en passants temporarily
            let enPassantsToAllow: EnPassant[] = [];
            let enPassantsToPlay: EnPassant[] = [];

            function notAlly(target: Square) {
                return pieces.get(target)?.color != piece!.color;
            }

            if (piece.role == "king") {
                pieceMoveSquares = squareOffsets(square, queenOffsets);
            } else if (piece.role == "knight") {
                pieceMoveSquares = squareOffsets(square, knightOffsets);
            } else if (piece.role == "rook") {
                pieceMoveSquares = squareSightlines(pieces, square, rookOffsets);
            } else if (piece.role == "bishop") {
                pieceMoveSquares = squareSightlines(pieces, square, bishopOffsets);
            } else if (piece.role == "queen") {
                pieceMoveSquares = squareSightlines(pieces, square, queenOffsets);
            } else if (piece.role == "pawn") {
                const [x, y] = XY(square);

                const push: [number, number] = piece.color == "white" ? [0, 1] : [0, -1];
                const doublePush: [number, number] = piece.color == "white" ? [0, 2] : [0, -2];
                const canDoublePush = piece.color == "white" ? y == 1 : y == 6;

                const captures: [number, number][] = piece.color == "white" ? [[-1, 1], [1, 1]] : [[-1, -1], [1, -1]];

                const pushes = canDoublePush ? [push, doublePush] : [push];
                const pushMoves = squareOffsets(square, pushes).filter(target => pieces.get(target) == undefined);
                const captureMoves = squareOffsets(square, captures).filter(target => {
                    return pieces.get(target)?.color == flipColor(piece.color)
                        || target == state.enPassant?.passedSquare;
                });

                pieceMoveSquares = pushMoves.concat(captureMoves);

                // remember en passants
                if (canDoublePush) {
                    enPassantsToAllow.push({
                        pawnSquare: squareOffset(square, doublePush)!,
                        passedSquare: squareOffset(square, push)!
                    });
                }
                captureMoves.map(target => {
                    if (target == state.enPassant?.passedSquare) {
                        enPassantsToPlay.push(state.enPassant);
                    }
                })
            }

            pieceMoveSquares = pieceMoveSquares.filter(target => notAlly(target));



            const pieceMoves = pieceMoveSquares.map(target => {
                const allowsEnPassant = enPassantsToAllow.find(enPassant => enPassant.pawnSquare == target);
                const isEnPassant = enPassantsToPlay.find(enPassant => enPassant.passedSquare == target);

                return {
                    from: square,
                    to: target,
                    isCapture: (pieces.get(target) || isEnPassant) != undefined,
                    allowsEnPassant: allowsEnPassant,
                    isEnPassant: isEnPassant,
                }
            });

            moves.set(square, pieceMoves);
        }

    })

    return moves;
}

export function getMoves(state: ChessState): Moves {
    const moves = getMovesAnyPlayer(state);
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
            if (state.pieces.get(move.from)?.color == state.turnColor && move.isCapture) {
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