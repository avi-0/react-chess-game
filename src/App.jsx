import { useEffect, useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor } from './chesslogic';
import useStateWithHistory from './hooks/useStateWithHistory';
import useTimeout from './hooks/useTimeout';

const startingPosition = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    turnColor: "white",
}

function App() {
    const [state, setState, {back: undo, forward: redo}] = useStateWithHistory(startingPosition, {capacity: 100});
    const [orientation, setOrientation] = useState("white");

    const [autoflip, setAutoflip] = useState(false);
    const { clear: autoflipClear, reset: autoflipReset } = useTimeout(() => flip(), 400);
    useEffect(() => {
        autoflipClear();
    }, []);

    function reset() {
        setState(startingPosition);
    }

    function flip() {
        setOrientation(orientation => flipColor(orientation));
    }

    function onMoved() {
        if (autoflip) {
            autoflipReset();
        }
    }

    return (
        <div className='App'>
            <Chessboard state={state} setState={setState} orientation={orientation} onMoved={onMoved}/>

            <div className='App-sidebar'>
                <button onClick={reset}>Reset</button>
                <button onClick={flip}>Flip</button>

                <label>
                    <input type="checkbox" checked={autoflip} onChange={e => setAutoflip(e.target.checked)}/>
                    Autoflip
                </label>

                <div className="flexspace"/>
                
                <button onClick={undo}>Undo</button>
                <button onClick={redo}>Redo</button>
            </div>
        </div>
    )
}

export default App
