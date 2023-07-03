import { Chessboard } from 'react-chessboard'
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <div className='chessboard'>
        <Chessboard />
      </div>
      
    </div>
  )
}

export default App
