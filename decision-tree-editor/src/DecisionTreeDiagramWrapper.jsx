// DecisionTreeDiagramWrapper.js

import React from 'react';
import { useParams } from 'react-router-dom';
import DecisionTreeDiagram from './DecisionTreeDiagram';

function DecisionTreeDiagramWrapper() {
  const { treeId } = useParams();

  return (
    <div>
      <h2>Tree ID: {treeId}</h2>
      <DecisionTreeDiagram treeId={treeId} />
    </div>
  );
}

export default DecisionTreeDiagramWrapper;
