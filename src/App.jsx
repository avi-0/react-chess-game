import { Chessboard } from 'react-chessboard'
import { useState } from 'react'
import './App.css'
import Chessground from '@react-chess/chessground'

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./chessground.css";


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <div className="chessboard-row-wrapper">
        <div className='chessboard-column-wrapper'>
          <div className='chessboard-wrapper'>
            <Chessground
              className='Chessboard'
              contained={true}
              config={{
                coordinates: false,
                draggable: {
                  enabled: false,
                },
                movable: {
                  free: true,
                  showDests: true,
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
