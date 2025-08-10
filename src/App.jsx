import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import Layout from './components/Layout.jsx';
function App() {
  return (
    <Layout >
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
    </Layout>
  );
}

export default App;
