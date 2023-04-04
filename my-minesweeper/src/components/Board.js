import React from "react";
import Cell from "./Cell";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Board.css";

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: this.createBoard(props.size, props.mines),
            gameState: {
                isOver: false,
                flagsUsed: 0,
                revealedCells: 0,
                startTime: null,
                elapsedTime: 0,
            },
        };
    }

    componentDidMount() {
        this.startTimer();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.gameState.isOver && this.state.gameState.isOver) {
            this.stopTimer();
            this.saveScore();
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    createBoard(size, numMines) {
        const cells = new Array(size * size).fill(null).map((_, i) => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
            position: i,
        }));

        // randomly place mines on the board
        for (let i = 0; i < numMines; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * size * size);
            } while (cells[randomIndex].isMine);
            cells[randomIndex].isMine = true;
        }

        // calculate the number of adjacent mines for each cell
        cells.forEach((cell, i) => {
            const adjacentPositions = this.getAdjacentPositions(i, size);
            const adjacentMines = adjacentPositions.filter(
                (pos) => cells[pos].isMine
            ).length;
            cell.adjacentMines = adjacentMines;
        });

        return cells;
    }

    getAdjacentPositions(position, size) {
        const isLeftEdge = position % size === 0;
        const isRightEdge = position % size === size - 1;
        const isTopEdge = position < size;
        const isBottomEdge = position >= size * (size - 1);

        const positions = [
            position - size - 1,
            position - size,
            position - size + 1,
            position - 1,
            position + 1,
            position + size - 1,
            position + size,
            position + size + 1,
        ];

        if (isLeftEdge) {
            positions.splice(0, 3);
        }

        if (isRightEdge) {
            positions.splice(5, 3);
        }

        if (isTopEdge) {
            positions.splice(0, 1);
            positions.splice(2, 1);
            positions.splice(4, 1);
        }

        if (isBottomEdge) {
            positions.splice(5, 1);
            positions.splice(7, 1);
            positions.splice(2, 1);
        }

        return positions.filter((pos) => pos >= 0 && pos < size * size);
    }

    handleClick(position) {
        if (this.state.gameState.isOver) {
            return;
        }

        const cells = [...this.state.cells];
        const cell = cells[position];

        if (cell.isRevealed || cell.isFlagged) {
            return;
        }

        if (cell.isMine) {
            this.handleGameOver(cells);
        } else {
            this.revealCell(cells, cell.position);
        }
    }

    handleContextMenu(event, position) {
        event.preventDefault();
        if (this.state.gameState && this.state.gameState.isOver) {
            return;
        }
        const cells = [...this.state.cells];
        const cell = cells[position];

        if (cell.isRevealed) {
            return;
        }

        cell.isFlagged = !cell.isFlagged;

        const flagsUsed = cell.isFlagged
            ? this.state.gameState.flagsUsed + 1
            : this.state.gameState.flagsUsed - 1;

        this.setState({
            cells,
            gameState: { ...this.state.gameState, flagsUsed },
        });
    }

    revealCell(cells, position) {
        const cell = cells[position];
        if (cell.isRevealed) {
            return;
        }

        cell.isRevealed = true;

        const gameState = { ...this.state.gameState };
        gameState.revealedCells++;

        if (cell.isMine) {
            this.handleGameOver(cells);
            return;
        }

        if (cell.adjacentMines === 0) {
            const adjacentPositions = this.getAdjacentPositions(
                position,
                this.props.size
            );
            adjacentPositions.forEach((pos) => {
                this.revealCell(cells, pos);
            });
        }

        if (gameState.revealedCells === cells.length - this.props.mines) {
            gameState.isOver = true;
        }

        this.setState({ cells, gameState });
    }

    handleGameOver(cells) {
        cells.forEach((cell) => {
            if (cell.isMine) {
                cell.isRevealed = true;
            }
        });
        const gameState = { ...this.state.gameState, isOver: true };
        this.setState({ cells, gameState });
    }

    startTimer() {
        const gameState = { ...this.state.gameState, startTime: Date.now() };
        this.timerID = setInterval(() => {
            gameState.elapsedTime = Math.floor(
                (Date.now() - gameState.startTime) / 1000
            );
            this.setState({ gameState });
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerID);
    }

    saveScore() {
        const { size, mines } = this.props;
        const { elapsedTime } = this.state.gameState;
        const score = { size, mines, elapsedTime };
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.push(score);
        localStorage.setItem("scores", JSON.stringify(scores));
    }

    renderCells() {
        const { cells } = this.state;
        const { size } = this.props;
        const rows = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const cell = cells[i * size + j];
                row.push(
                    <Cell
                        key={cell.position}
                        onClick={() => this.handleClick(cell.position)}
                        onContextMenu={(event) =>
                            this.handleContextMenu(event, cell.position)
                        }
                        cell={cell}
                        size={30}
                        gameState={this.state.gameState}
                    />
                );
            }
            rows.push(<div key={i} className="board-row">{row}</div>);
        }
        return rows;
    }

    render() {
        const { gameState } = this.state;
        const remainingMines = this.props.mines - gameState.flagsUsed;
        return (
            <div className="Board">
                <div className="game-info">
                    <div className="game-info-item">
                        Flags: {gameState.flagsUsed}/{this.props.mines}
                    </div>
                    <h2 className="game-info-item">Time: {gameState.elapsedTime}</h2>
                </div>
                <h3 className="remaining-mines">Remaining Mines: {remainingMines}</h3>
                {this.renderCells()}
            </div>
        );
    }
}
    

export default Board;