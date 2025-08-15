import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { UserThemeProvider } from "./contexts/UserThemeContext";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import Layout from './components/Layout'
export default function App() {
  return (
    <UserThemeProvider>
      <Layout>
      <DndProvider backend={HTML5Backend}>
       
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
        
      </DndProvider>
      </Layout>
    </UserThemeProvider>
  );
}
