import { useEffect, useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor, getMoves, makeSimpleFen, startingPosition } from './chesslogic';
import useStateWithHistory from './hooks/useStateWithHistory';
import useTimeout from './hooks/useTimeout';
import { Color, Key } from 'chessground/types';
import { Chess } from 'chess.js';
import { ToggleButton } from './components/ToggleButton/ToggleButton';

function App() {
    const [state, setState, { back: undo, forward: redo }] = useStateWithHistory(startingPosition, { capacity: 100 });
    const [orientation, setOrientation] = useState<Color>("white");

    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));
    const [captureSound, setCaptureSound] = useState(new Audio("/sounds/capture.mp3"));
    useEffect(() => {
        moveSound.volume = 0.4;
        captureSound.volume = 0.4;
    }, [moveSound, captureSound]);

    const [moveType, setMoveType] = useState("normal");
    function selectMoveType(type: string) {
        if (type != moveType) {
            setMoveType(type);
        } else {
            setMoveType("normal");
        }
    }

    const { moves, captures } = getMoves(state);
    function onMoved(from: Key, to: Key) {
        if (captures.has(from + to)) {
            captureSound.play();
        } else {
            moveSound.play();
        }

        setMoveType("normal");

        if (autoflip) {
            autoflipReset();
        }
    }

    const { moves: telepathyMoves } = getMoves({...state, turnColor: flipColor(state.turnColor)});

    let chessboardMoves = moves;
    if (moveType == "telepathy") {
        chessboardMoves = telepathyMoves;
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
                state={state} onChange={setState}
                orientation={orientation}
                moves={chessboardMoves}
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

                <p>Abilities:</p>
                <ToggleButton active={moveType == "telepathy"} onClick={() => selectMoveType("telepathy")}>Telepathy</ToggleButton>
                <ToggleButton active={moveType == "bombthrow"} onClick={() => selectMoveType("bombthrow")}>Bomb Throw</ToggleButton>

                <div className="flexspace" />

                <button onClick={undo}>Undo</button>
                <button onClick={redo}>Redo</button>
            </div>
        </div>
    )
}

export default App
