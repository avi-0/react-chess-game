import Chessground from '@react-chess/chessground';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import "./Chessboard.css";

export default function Chessboard() {
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
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}