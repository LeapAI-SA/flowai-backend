// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DecisionTreeDiagramWrapper from './DecisionTreeDiagramWrapper';
import TreeList from './TreeList';
import TreeInput from './TreeInput';
import './App.css'; // Custom CSS for styling

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Conditionally render the TreeInput based on the route */}
      {location.pathname === '/' && <TreeInput />}
      <Routes>
        <Route path="/" element={<TreeList />} />
        <Route path="/:treeId" element={<DecisionTreeDiagramWrapper />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
