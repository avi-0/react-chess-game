import { useEffect, useState } from 'react';
import './App.css';

import Chessboard from './components/Chessboard/Chessboard';
import { ChessState, Move, flipColor, getMoves, startingPosition } from './chesslogic';
import useStateWithHistory from './hooks/useStateWithHistory';
import useTimeout from './hooks/useTimeout';
import { Color } from 'chessground/types';
import { ToggleButton } from './components/ToggleButton/ToggleButton';

function App() {
    const [state, setState, { back: undo, forward: redo }]: [ChessState, any, any] = useStateWithHistory(startingPosition, { capacity: 100 }) as any;
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

    const moves = getMoves(state);
    const telepathyMoves = getMoves({...state, turnColor: flipColor(state.turnColor)});

    let chessboardMoves = moves;
    if (moveType == "telepathy") {
        chessboardMoves = telepathyMoves;
    }

    function onMovePlayed(move: Move) {
        console.log(state, move);
        // make new Pieces and move piece mover
        const pieces = new Map(state.pieces);
        const pieceMoved = state.pieces.get(move.from);
        if (pieceMoved) {
            pieces.delete(move.from);
            pieces.set(move.to, pieceMoved);
        }

        // apply enPassant if present
        if (move.isEnPassant) {
            pieces.delete(move.isEnPassant.pawnSquare);
        }

        // pass turn to other player, in case of nonstandard move order when cheating
        const turnColor = flipColor(state.pieces.get(move.from)?.color || "white");

        setState({
            ...state,

            pieces: pieces,
            turnColor: turnColor,
            lastMove: [move.from, move.to],
            justCaptured: move.isCapture,
            enPassant: move.allowsEnPassant,
        });

        if (move.isCapture) {
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
                state={state} onMovePlayed={onMovePlayed}
                orientation={orientation}
                moves={chessboardMoves}
                cheat={cheat} />

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
