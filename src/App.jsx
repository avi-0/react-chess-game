import { useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor } from './util';

const startingPosition = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    orientation: "white",
    turnColor: "white",
}

function App() {
    const [state, setState] = useState(startingPosition);
    const [autoflip, setAutoflip] = useState(false); 

    function reset() {
        setState(startingPosition);
    }

    function flip() {
        setState(state => {
            return {...state, orientation: flipColor(state.orientation)}
        })
    }

    function onMoved() {
        if (autoflip) {
            flip()
        }
    }

    return (
        <div className='App'>
            <Chessboard state={state} setState={setState} onMoved={onMoved}/>

            <div className='App-sidebar'>
                <button onClick={reset}>Reset</button>
                <button onClick={flip}>Flip</button>

                <label>
                    <input type="checkbox" checked={autoflip} onChange={e => setAutoflip(e.target.checked)}/>
                    Autoflip
                </label>
            </div>
        </div>
    )
}

export default App
