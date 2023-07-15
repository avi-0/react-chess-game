import { Chessground as ChessgroundApi } from 'chessground';
import { read as readFen } from 'chessground/src/fen'
import { useEffect, useRef, useState } from 'react';

import "./chessground.base.css";
import "./chessground.brown.css";
import "./Chessboard.css";
import { ChessState, Move, fenFromPieces, flipColor, getMoves, makeSimpleFen, piecesFromFen } from '../../chesslogic';
import { Color, Key as Square, MoveMetadata } from 'chessground/types';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

export type ChessboardProps = {
    state: ChessState,
    onChange: (state: ChessState) => void,

    orientation: Color,
    cheat: boolean,

    moves: Map<Square, Move[]>,

    onMoved: (from: Square, to: Square) => void,
}

export default function Chessboard({
    state,
    onChange = () => { },
    orientation,
    cheat,
    moves,
    onMoved: onMovedProp = () => { }
}: ChessboardProps) {
    const ref = useRef(null);
    const [api, setApi] = useState<Api | null>(null);

    function onMoved(from: Square, to: Square, meta: MoveMetadata) {
        // update state to reflect change

        if (api) {
            // find which move this was
            const movePlayed = moves.get(from)?.find(move => move.to == to)

            // pass turn to other player, in case of nonstandard move order when cheating
            const turnColor = flipColor(api.state.pieces.get(to)?.color || "white")

            // pass state up
            onChange({
                ...state,

                pieces: piecesFromFen(api.getFen()),
                turnColor: turnColor,
                lastMove: api.state.lastMove,
                justCaptured: movePlayed?.isCapture,
                enPassantSquare: movePlayed?.enPassantSquare,
            });
        }

        onMovedProp(from, to);
    }

    // first time setup
    useEffect(() => {
        if (ref.current && !api) {
            const chessgroundApi = ChessgroundApi(ref.current);
            setApi(chessgroundApi);
        }
    }, [ref]);

    // update inner state
    useEffect(() => {
        if (api) {
            const chessgroundMoves = new Map(
                Array.from(moves.entries()).map(([from, moves]) => 
                    [from, moves.map(move => move.to)]
                )
            );

            const config: Config = {
                // actual game position
                fen: fenFromPieces(state.pieces),
                turnColor: state.turnColor,
                lastMove: state.lastMove,

                // visual options and callbacks
                orientation: orientation,

                animation: { enabled: true, duration: 300 },
                draggable: {
                    enabled: true,
                },
                movable: {
                    free: cheat,
                    showDests: true,
                    dests: chessgroundMoves,
                    events: {
                        after: onMoved,
                    },
                }
            }

            api.set(config);
        }
    }, [api, state, orientation, onMoved, cheat]);

    return (
        <div className="chessboard-row-wrapper">
            <div className='chessboard-column-wrapper'>
                <div ref={ref} className='chessboard' />
            </div>
        </div>
    )
}