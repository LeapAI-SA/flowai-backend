// TreeList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './TreeList.css'; // Custom CSS for visual appeal

function TreeList() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/trees`)
      .then((response) => {
        setTrees(response.data);
      })
      .catch((error) => {
        console.error('Error fetching trees:', error);
      });
  }, []);

  return (
    <div className="tree-list-container">
      <h2 className="title">Available Trees</h2>
      <ul className="tree-list">
        {trees.map((tree) => (
          <li key={tree._id} className="tree-item">
            <div className="tree-info">
              <strong>Tree ID:</strong>{' '}
              <Link to={`/${tree.treeId}`} className="tree-id-link">
                {tree.treeId}
              </Link>
              <br />
              <strong>Description:</strong>{' '}
              <ClickableDescription description={tree.description || 'No description available'} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Clickable description that expands/collapses on click
function ClickableDescription({ description }) {
  const [expanded, setExpanded] = useState(false);

  const truncatedDescription = description.substring(0, 100); // Limit to 100 characters

  return (
    <p
      className={`description-text ${expanded ? 'expanded' : 'collapsed'}`} // Dynamically apply classes
      onClick={() => setExpanded(!expanded)} // Toggle expanded state on click
    >
      {expanded ? description : `${truncatedDescription}...`}
    </p>
  );
}

export default TreeList;
