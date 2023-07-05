import { Chessground as ChessgroundApi } from 'chessground';
import { read as readFen } from 'chessground/src/fen'
import { useEffect, useRef, useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";
import { Chess, SQUARES } from 'chess.js';

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

function makePermissiveFen(api) {
    const state = api.state;

    const fen = `${api.getFen()} ${state.turnColor == 'white' ? 'w' : 'b'}  KQkq - 0 1`

    console.log(fen);
    return fen;
}

function flipColor(color) {
    return color == 'white' ? 'black' : 'white';
}




export default function Chessboard({ fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", setFen = () => {}}) {
    const ref = useRef(null);
    const [api, setApi] = useState(null);
    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));

    function onMoved(orig, dest, meta) {
        moveSound.play();

        // same player might have moved twice, but pass the "legal" move to other player anyway
        api.state.turnColor = flipColor(api.state.pieces.get(dest).color)

        setFen(makePermissiveFen(api));
    }

    let chess = new Chess();
    try {
        chess.load(fen);
    } catch {
        chess = null;
    }
    const config = {
        coordinates: false,
        draggable: {
            enabled: true,
        },
        movable: {
            free: true,
            showDests: true,
            dests: getDests(chess),
            events: {
                after: (orig, dest, meta) => onMoved(orig, dest, meta),
            },
        }
    }

    useEffect(() => {
        if (ref && ref.current && !api) {
            const chessgroundApi = ChessgroundApi(ref.current, {
                animation: { enabled: true, duration: 200 },
                ...config,
            });
            setApi(chessgroundApi);
        } else if (ref && ref.current && api) {
            api.set(config);
        }
    }, [ref]);

    useEffect(() => {
        api?.set(config);
    }, [api, config]);

    useEffect(() => {
        if (api) {
            api.state.pieces = readFen(fen);
        }
    }, [api, fen])

    return (
        <div className="chessboard-row-wrapper">
            <div className='chessboard-column-wrapper'>
                <div ref={ref} className='chessboard' />
            </div>
        </div>
    )
}