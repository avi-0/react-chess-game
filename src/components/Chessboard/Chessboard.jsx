import { Chessground as ChessgroundApi } from 'chessground';
import { read as readFen } from 'chessground/src/fen'
import { useEffect, useRef, useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";
import { Chess, SQUARES } from 'chess.js';
import { flipColor } from '../../util';

function getDests(chess) {
    const dests = new Map();

    if (chess) {
        SQUARES.forEach(s => {
            const ms = chess.moves({ square: s, verbose: true });
            if (ms.length) dests.set(s, ms.map(m => m.to));
        });
    }

    return dests;
}

function makePermissiveFen(state) {
    return `${state.fen} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`
}

export default function Chessboard({ state, setState = () => {}, orientation, onMoved: onMovedProp = () => {}}) {
    const ref = useRef(null);
    const [api, setApi] = useState(null);
    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));

    function onMoved(orig, dest, meta) {
        // update state to reflect change!

        // pass turn to other player
        // (even if last move was made by the wrong player)
        const turnColor = flipColor(api.state.pieces.get(dest).color)

        setState(state => {
            return {
                ...state,
                fen: api.getFen(),
                turnColor: turnColor,
            }
        });

        // also play sounds
        moveSound.play();

        onMovedProp();
    }

    // make a new Chess object to get legal moves for current position
    let chess = new Chess();
    try {
        chess.load(makePermissiveFen(state));
    } catch {
        chess = null;
    }
    const dests = getDests(chess);
    const config = {
        fen: state.fen,
        turnColor: state.turnColor,

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
                after: (orig, dest, meta) => onMoved(orig, dest, meta),
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