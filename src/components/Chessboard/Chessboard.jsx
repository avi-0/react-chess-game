import Chessground from '@react-chess/chessground';
import { useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";
import { Chess, SQUARES } from 'chess.js';

export default function Chessboard() {
    const [chess, setChess] = useState(new Chess());

    const [moveSound, setMoveSound] = useState(new Audio("/sounds/move.mp3"));

    function onMoved(orig, dest, meta) {
        moveSound.play();

        setChess((chess) => {
            const newChess = new Chess(chess.fen());
            newChess.move({from: orig, to: dest});
            return newChess;
        })
    }

    function getDests() {
        const dests = new Map();
        SQUARES.forEach(s => {
          const ms = chess.moves({square: s, verbose: true});
          if (ms.length) dests.set(s, ms.map(m => m.to));
        });
        return dests;
      }

    return (
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
                                dests: getDests(),
                                events: {
                                    after: (orig, dest, meta) => onMoved(orig, dest, meta),
                                },
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}