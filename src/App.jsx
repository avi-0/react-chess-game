import { useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';
import { flipColor } from './util';

const startingPosition = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    orientation: "white",
}

function App() {
    const [state, setState] = useState(startingPosition);

    function reset() {
        setState(startingPosition);
    }

    function flip() {
        setState(state => {
            return {...state, orientation: flipColor(state.orientation)}
        })
    }

    return (
        <div className='App'>
            <Chessboard state={state} setState={setState} />
            <div className='App-sidebar'>
                <button onClick={reset}>Reset</button>
                <button onClick={flip}>Flip</button>
            </div>
        </div>
    )
}

export default App
