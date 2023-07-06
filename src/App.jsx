import { useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';

const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

function App() {
    const [state, setState] = useState(startingPosition);

    function onResetClicked() {
        setState(startingPosition);
    }

    return (
        <div className='App'>
            <Chessboard state={state} setState={setState} />
            <div className='App-sidebar'>
                <button onClick={onResetClicked}>Reset</button>
            </div>
        </div>
    )
}

export default App
