import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Sidebar from './components/Sidebar/Sidebar.js';
import Board from './components/Board/Board.js';
import List from './components/List/List.js';
import Project from './components/Project/Project.js';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/board" element={<Board />} />
            <Route path="/list" element={<List />} />
            <Route path="/" element={<Board />} />
            <Route path="/project" element={<Project />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;