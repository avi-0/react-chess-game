import { useEffect, useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor, getMoves, makeSimpleFen, startingPosition } from './chesslogic';
import useStateWithHistory from './hooks/useStateWithHistory';
import useTimeout from './hooks/useTimeout';
import { Color, Key } from 'chessground/types';
import { Chess } from 'chess.js';

function App() {
    const [state, setState, { back: undo, forward: redo }] = useStateWithHistory(startingPosition, { capacity: 100 });
    const [orientation, setOrientation] = useState<Color>("white");

    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));
    const [captureSound, setCaptureSound] = useState(new Audio("/sounds/capture.mp3"));
    useEffect(() => {
        moveSound.volume = 0.4;
        captureSound.volume = 0.4;
    }, [moveSound, captureSound]);

    // make a new Chess.js object to get legal moves for current position
    let chess: Chess | undefined = new Chess();
    try {
        // simplified for now - assumes full castling rights and no en passants, they're not stored yet
        chess.load(makeSimpleFen(state));
    } catch {
        // chess.js errors on illegal positions, fuck it then
        chess = undefined;
    }
    const { moves, captures } = getMoves(chess);

    function onMoved(from: Key, to: Key) {
        if (captures.has(from + to)) {
            captureSound.play();
        } else {
            moveSound.play();
        }

        if (autoflip) {
            autoflipReset();
        }
    }

    function reset() {
        setState(startingPosition);
    }

    function flip() {
        setOrientation(orientation => flipColor(orientation));
    }

    // autoflip (flip after every move, with delay)
    const [autoflip, setAutoflip] = useState(false);
    const { clear: autoflipClear, reset: autoflipReset } = useTimeout(() => flip(), 600);
    useEffect(() => {
        autoflipClear();
    }, []);

    const [cheat, setCheat] = useState(false);

    return (
        <div className='App'>
            <Chessboard
                state={state} setState={setState}
                orientation={orientation}
                moves={moves}
                cheat={cheat}
                onMoved={onMoved} />

            <div className='App-sidebar'>
                <button onClick={reset}>Reset</button>
                <button onClick={flip}>Flip</button>

                <label>
                    <input type="checkbox" checked={autoflip} onChange={e => setAutoflip(e.target.checked)} />
                    Autoflip
                </label>
                <label>
                    <input type="checkbox" checked={cheat} onChange={e => setCheat(e.target.checked)} />
                    Cheat
                </label>

                <div className="flexspace" />

                <button onClick={undo}>Undo</button>
                <button onClick={redo}>Redo</button>
            </div>
        </div>
    )
}

export default App
