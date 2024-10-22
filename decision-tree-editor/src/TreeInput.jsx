// TreeInput.jsx

import React, { useState } from 'react';

function TreeInput() {
  const [treeId, setTreeId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (treeId) {
      window.location.href = `/${treeId}`;
    }
  };

  return (
    <div className="tree-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={treeId}
          onChange={(e) => setTreeId(e.target.value)}
          placeholder="Enter Tree ID"
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
}

export default TreeInput;
