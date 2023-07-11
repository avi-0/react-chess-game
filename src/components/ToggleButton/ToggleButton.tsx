import { MouseEventHandler, ReactNode } from "react";
import "./ToggleButton.css";

type Props = {
    children: ReactNode,
    active?: boolean,
    onClick?: MouseEventHandler,
}

export function ToggleButton({ active, onClick, children }: Props) {
    return <button 
        className={`ToggleButton ${active && "ToggleButton-active"}`}
        onClick={onClick}>
        {children}
    </button>
}