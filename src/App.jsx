import { useState } from 'react'
import './App.css'

import Chessboard from './components/Chessboard/Chessboard';

const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

function App() {
    const [fen, setFen] = useState(startingPosition);

    function onResetClicked() {
        setFen(startingPosition);
    }

    return (
        <div className='App'>
            <Chessboard fen={fen} setFen={setFen} />
            <div>
                <button onClick={onResetClicked}>Reset</button>
            </div>
        </div>
    )
}

export default App
