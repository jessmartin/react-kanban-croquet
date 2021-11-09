import React, { useState } from "react";
import ReactDOM from "react-dom";
import Board, { moveCard } from "@lourenci/react-kanban";
import "@lourenci/react-kanban/dist/styles.css";
// Use your own styles to override the default styles
// import "./styles.css";

import { App as CroquetApp, Model } from "@croquet/croquet";
import {
  usePublish,
  useModelRoot,
  InCroquetSession,
  useSubscribe,
  CroquetContext
} from "@croquet/react";

const board = {
  columns: [
    {
      id: 1,
      title: "Backlog",
      cards: [
        {
          id: 1,
          title: "Card 1",
          description: "This is a card",
        }
      ]
    },
    {
      id: 2,
      title: "Backlog",
      cards: [
      ]
    }
  ]
};

class KanbanModel extends Model {
  init(option) {
    super.init(option);
    this.board = board;
    this.subscribe(this.id, "dragCard", this.onDragCard);
  }

  onDragCard({ source, destination }) {
    const updatedBoard = moveCard(this.board, source, destination);
    this.board = updatedBoard;
    this.publish(this.id, "updateBoard");
    console.log(this.board);
  }
}
KanbanModel.register("KanbanModel");

function ControlledBoard() {
  // You need to control the state yourself.
  const model = useModelRoot();
  const [controlledBoard, setBoard] = useState(model.board);

  const publishCardDrag = usePublish((source, destination) => [model.id, "dragCard", { source, destination }]);
  useSubscribe(model.id, "updateBoard", updateBoard);

  function updateBoard() {
    console.log(model.board);
    setBoard(model.board);
  }

  function handleCardMove(_card, source, destination) {
    const updatedBoard = moveCard(controlledBoard, source, destination);
    setBoard(updatedBoard);
    publishCardDrag(source, destination);
    // console.log(updatedBoard)
  }

  return (
    <Board onCardDragEnd={handleCardMove} disableColumnDrag>
      {controlledBoard}
    </Board>
  );
}

function App() {
  return (
    <InCroquetSession
      apiKey="18fIEcbGu1vlEAc4bnppPMtIccJ5xIn6J1dJGMeay"
      appId="in.jessmart.react.kanban"
      password={CroquetApp.autoPassword()}
      name={CroquetApp.autoSession()}
      model={KanbanModel}
    >
      <ControlledBoard />
    </InCroquetSession>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
