import { useEffect, useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor, startingPosition } from './chesslogic';
import useStateWithHistory from './hooks/useStateWithHistory';
import useTimeout from './hooks/useTimeout';

function App() {
    const [state, setState, { back: undo, forward: redo }] = useStateWithHistory(startingPosition, { capacity: 100 });
    const [orientation, setOrientation] = useState("white");

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

    function onMoved() {
        if (autoflip) {
            autoflipReset();
        }
    }

    return (
        <div className='App'>
            <Chessboard state={state} setState={setState} orientation={orientation} onMoved={onMoved} />

            <div className='App-sidebar'>
                <button onClick={reset}>Reset</button>
                <button onClick={flip}>Flip</button>

                <label>
                    <input type="checkbox" checked={autoflip} onChange={e => setAutoflip(e.target.checked)} />
                    Autoflip
                </label>

                <div className="flexspace" />

                <button onClick={undo}>Undo</button>
                <button onClick={redo}>Redo</button>
            </div>
        </div>
    )
}

export default App
