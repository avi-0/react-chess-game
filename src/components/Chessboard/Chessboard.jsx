import { Chessground as ChessgroundApi } from 'chessground';
import { read as readFen } from 'chessground/src/fen'
import { useEffect, useRef, useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";
import { Chess } from 'chess.js';
import { flipColor, getMoves, makeSimpleFen } from '../../chesslogic';



export default function Chessboard({ state, setState = () => {}, orientation, onMoved: onMovedProp = () => {}}) {
    const ref = useRef(null);
    const [api, setApi] = useState(null);

    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));
    const [captureSound, setCaptureSound] = useState(new Audio("/sounds/capture.mp3"));
    useEffect(() => {
        moveSound.volume = 0.4;
        captureSound.volume = 0.4;
    }, [moveSound, captureSound]);

    // make a new Chess object to get legal moves for current position
    let chess = new Chess();
    try {
        chess.load(makeSimpleFen(state));
    } catch {
        // chess.js errors on illegal positions, fuck it then
        chess = null;
    }
    const { dests, captures } = getMoves(chess);

    function onMoved(orig, dest, meta) {
        // update state to reflect change

        // in case of illegal moves, pass turn to other player
        const turnColor = flipColor(api.state.pieces.get(dest).color)

        setState(state => {
            return {
                ...state,
                fen: api.getFen(),
                turnColor: turnColor,
                lastMove: api.state.lastMove,
            }
        });

        // also play sounds
        if (captures.has(orig + dest)) {
            captureSound.play()
        } else {
            moveSound.play();
        }

        onMovedProp();
    }

    const config = {
        fen: state.fen,
        turnColor: state.turnColor,
        lastMove: state.lastMove,

        orientation: orientation,

        animation: { enabled: true, duration: 200 },
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

    useEffect(() => {
        if (ref && ref.current && !api) {
            const chessgroundApi = ChessgroundApi(ref.current, config);
            setApi(chessgroundApi);
        }
    }, [ref]);

    useEffect(() => {
        api?.set(config);
    }, [api, config]);

    return (
        <div className="chessboard-row-wrapper">
            <div className='chessboard-column-wrapper'>
                <div ref={ref} className='chessboard' />
            </div>
        </div>
    )
}