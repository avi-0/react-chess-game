import { Chessground as ChessgroundApi } from 'chessground';
import { read as readFen } from 'chessground/src/fen'
import { useEffect, useRef, useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";
import { Chess } from 'chess.js';
import { ChessState, flipColor, getMoves, makeSimpleFen } from '../../chesslogic';
import { Color, Key, MoveMetadata } from 'chessground/types';
import { Api } from 'chessground/api';

export type ChessboardProps = {
    state: ChessState,
    setState: (state: ChessState) => void,
    orientation: Color,
    onMoved: () => void,
}

export default function Chessboard({
    state,
    setState = () => { },
    orientation,
    onMoved: onMovedProp = () => { }
}: ChessboardProps) {
    const ref = useRef(null);
    const [api, setApi] = useState<Api | null>(null);

    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));
    const [captureSound, setCaptureSound] = useState(new Audio("/sounds/capture.mp3"));
    useEffect(() => {
        moveSound.volume = 0.4;
        captureSound.volume = 0.4;
    }, [moveSound, captureSound]);

    // make a new Chess.js object to get legal moves for current position
    let chess: Chess | undefined = new Chess();
    try {
        chess.load(makeSimpleFen(state));
    } catch {
        // chess.js errors on illegal positions, fuck it then
        chess = undefined;
    }
    const { dests, captures } = getMoves(chess);

    function onMoved(orig: Key, dest: Key, meta: MoveMetadata) {
        // update state to reflect change

        if (api) {
            // pass turn to other player, in case of nonstandard move order
            const turnColor = flipColor(api.state.pieces.get(dest)?.color || "white")

            // pass state up
            setState({
                ...state,
                fen: api.getFen(),
                turnColor: turnColor,
                lastMove: api.state.lastMove,
            });
        }

        // also play sounds
        if (captures.has(orig + dest)) {
            captureSound.play()
        } else {
            moveSound.play();
        }

        onMovedProp();
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
            const config = {
                // actual game position
                fen: state.fen,
                turnColor: state.turnColor,
                lastMove: state.lastMove,

                // visual options and callbacks
                orientation: orientation,

                animation: { enabled: true, duration: 300 },
                coordinates: false,
                draggable: {
                    enabled: true,
                },
                movable: {
                    free: false,
                    showDests: true,
                    dests: dests,
                    events: {
                        after: onMoved,
                    },
                }
            }

            api.set(config);
        }
    }, [api, state, orientation]);

    return (
        <div className="chessboard-row-wrapper">
            <div className='chessboard-column-wrapper'>
                <div ref={ref} className='chessboard' />
            </div>
        </div>
    )
}