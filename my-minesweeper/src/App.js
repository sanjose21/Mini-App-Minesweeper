import React from "react";
import Board from "./components/Board";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Minesweeper</h1>
      <Board size={10} mines={10} />
    </div>
  );
}

export default App;
