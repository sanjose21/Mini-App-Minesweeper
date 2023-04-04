import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './Cell.css';

class Cell extends React.Component {
    render() {
        const { cell, onClick, size } = this.props;
        const cellSize = 300 / size;
        const cellStyle = {
            width: `${cellSize}vmin`,
            height: `${cellSize}vmin`,
        };

        let content = "";

        if (cell.isRevealed) {
            if (cell.isMine) {
                content = <div className="mine-overlay" />;
            } else if (cell.adjacentMines > 0) {
                content = cell.adjacentMines;
            }
        } else if (cell.isFlagged) {
            content = <div className="flag-overlay" />;
        }

        return (
            <div
                className={`cell ${cell.isRevealed ? "revealed" : ""} ${cell.isMine ? "mine" : ""
                    } ${cell.isFlagged ? "flagged" : ""}`}
                style={cellStyle}
                onClick={onClick}
                onContextMenu={this.props.onContextMenu}
            >
                {content}
            </div>
        );
    }
}

export default Cell;

