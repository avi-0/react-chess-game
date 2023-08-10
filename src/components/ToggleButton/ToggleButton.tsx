import { MouseEventHandler, ReactNode } from "react";
import "./ToggleButton.css";

type Props = {
    children: ReactNode,
    active?: boolean,
    onClick?: MouseEventHandler,
}

export function ToggleButton({ active, onClick, children }: Props) {
    return <button 
        className={`btn ${active ? "btn-primary" : "btn-secondary"}`}
        onClick={onClick}>
        {children}
    </button>
}