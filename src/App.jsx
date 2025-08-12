import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SimpleDND from "./components2/SimpleDnD";

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <SimpleDND />
    </DndProvider>
  );
}
