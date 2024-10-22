import React, { useState, useEffect, useRef } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import axios from 'axios';

// defining the component that takes in prop treeId
function DecisionTreeDiagram({ treeId }) {
  const [treeData, setTreeData] = useState(null); // state variable to hold in the tree data fetched from the backend
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // bool state flag to check if changes have been made or not to the diagram
  const diagramRef = useRef(null); // reference to the GoJS diagram instance
  useEffect(() => { // hook runs when component is mounted or tree id is changed
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/tree/${treeId}`) // get request to fetch the tree
      .then(response => {
        setTreeData(response.data); // setting state with the fetched data
      })
      .catch(error => {
        console.error('Error fetching tree data:', error);
      });
  }, [treeId]);

  // initializing the diagram
  const initDiagram = () => {
    const $ = go.GraphObject.make; // Initialize the GoJS diagram.

    // creating the diagram object
    const newDiagram = $(go.Diagram, { 
      'undoManager.isEnabled': true,
      'linkingTool.isEnabled': true,
      'relinkingTool.isEnabled': true,
      'toolManager.hoverDelay': 100,
      model: $(go.GraphLinksModel, {
        linkKeyProperty: 'key'  // Important for React integration
      }),
      layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 }), // setting tree structure
    });

    // Define the Node template with name and description and options to add, edit name, edit description and delete
    newDiagram.nodeTemplate = $(
      go.Node,
      'Auto',
      {
        contextMenu: $(
          go.Adornment,
          'Vertical',
          $('ContextMenuButton',
            $(go.TextBlock, 'Add Child'),
            { click: (e, obj) => addChildNode(e, obj) }
          ),
          $('ContextMenuButton',
            $(go.TextBlock, 'Edit Name'),
            { click: (e, obj) => editNode(e, obj, 'name') }
          ),
          $('ContextMenuButton',
            $(go.TextBlock, 'Edit Description'),
            { click: (e, obj) => editNode(e, obj, 'description') }
          ),
          $('ContextMenuButton',
            $(go.TextBlock, 'Delete'),
            { click: (e, obj) => deleteNode(e, obj) }
          )
        ),
        fromSpot: go.Spot.AllSides,    // Links can come from any side
        toSpot: go.Spot.AllSides,      // Links can go to any side
        fromLinkable: true,
        toLinkable: true,
        cursor: 'pointer'
      },
      $(go.Shape, 'RoundedRectangle', { fill: 'lightblue', strokeWidth: 1 }, new go.Binding('fill', 'color')),
      $(go.Panel, 'Vertical',
        { margin: 5 },
        $(go.TextBlock,
          { font: 'bold 12pt sans-serif', editable: true, name: 'NAME' },
          new go.Binding('text', 'name').makeTwoWay()
        ),
        $(go.TextBlock,
          { font: 'italic 10pt sans-serif', editable: true, name: 'DESCRIPTION', wrap: go.TextBlock.WrapFit, width: 150 },
          new go.Binding('text', 'description').makeTwoWay()
        )
      )
    );

    // Define the Link template / arrows between nodes
    newDiagram.linkTemplate =$(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,  // Ensures the link routes around the nodes
        corner: 5,                      // Adds a slight corner to the links
        relinkableFrom: true,
        relinkableTo: true,
        selectable: true,
        curve: go.Link.JumpOver,        // Makes the link jump over other links if they cross
        toShortLength: 2
      },
      $(go.Shape),                      // The link's path
      $(go.Shape, { toArrow: 'Standard' }) // The arrow at the end of the link
    );

    diagramRef.current = newDiagram; // storing diagram instance
    return newDiagram;
  };

  // node manipulation functions
  const addChildNode = (e, obj) => {
    const diagram = diagramRef.current; // retrieving diagram instance
    if (!diagram) return;

    const node = obj.part.data; // retrieve the data associated with the diagram part that triggered the action
    const baseName = "New Node"; // base name
    let newName = baseName;
    let counter = 1;

    // Ensure uniqueness by checking if the name already exists in the model
    while (diagram.model.findNodeDataForKey(newName)) {
      newName = `${baseName} ${counter}`;
      counter++; // append index 
    }

    // default characteristics for the new node object
    const newNode = {
      key: newName,
      name: newName,
      description: 'New description',
      type: 'text', // Default type, can be changed based on user input later
      children: []
    };

    diagram.model.startTransaction('add node'); // starting transaction to add node
    diagram.model.addNodeData(newNode); // adds the node
    diagram.model.addLinkData({ from: node.key, to: newName }); // creating arrow btw parent node and new node
    diagram.model.commitTransaction('add node'); // commiting the transaction meaning applying the changes
    setHasUnsavedChanges(true); // updating state telling their are unsaved changes
  };

  //editing either node name or description that is specified by the field
  const editNode = (e, obj, field) => {
    const diagram = diagramRef.current;  // retrieving diagram instance
    if (!diagram) return;

    const node = obj.part.data; // retrive the node data that has to be edited
    const diagramNode = diagram.findNodeForKey(node.key); // find the relevant node object

    if (!diagramNode) return;

    diagram.startTransaction('edit node'); // starting the transaction to edit the node

    const textBlock = diagramNode.findObject(field === 'name' ? 'NAME' : 'DESCRIPTION'); // locates the TextBlock and checks whether name is to be edited or the description
    if (textBlock) {
      diagram.commandHandler.editTextBlock(textBlock); // if TextBlock is found, edit it
    }

    diagram.commitTransaction('edit node'); // apply the changes
    setHasUnsavedChanges(true);  // updating state telling their are unsaved changes which need to be saved
  };

  const deleteNode = (e, obj) => {
    const diagram = diagramRef.current; // retrieving the diagram instance
    if (!diagram) return;

    const node = obj.part.data; // retrive the node data that has to be deleted

    const linksToNode = diagram.model.linkDataArray.filter(link => link.to === node.key);

    if (linksToNode.length === 0) {
      alert('The root node cannot be deleted.'); // Alert the user if they try to delete the root node
      return; // Exit the function without deleting
    }

    diagram.startTransaction('delete node'); // starting the transaction
    diagram.model.removeNodeData(node); // removing the node
    diagram.commitTransaction('delete node'); // applying the changes
    setHasUnsavedChanges(true); // updating state telling their are unsaved changes which need to be saved
  };

  // function called whenever diagram changes
  const handleModelChange = (event) => {
    setHasUnsavedChanges(true); // updaes state telling changes have been made that need to be saved
  };

  // function to save the changes
  const saveChanges = () => {
    const updatedTree = convertGoJSModelToTree();
    const formattedTree = convertToFormattedTree(updatedTree);
    setHasUnsavedChanges(false);
    // Save to backend
    axios.put(`${process.env.REACT_APP_API_BASE_URL}/tree/${treeId}`, { flowTree: formattedTree })
      .then(() => {
        alert('Changes saved successfully!');
        // Update treeData state with the updated tree to reflect changes immediately
        setTreeData(updatedTree);
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        alert('Error saving changes!');
      });
  };

  // function to convert the GoJS diagram model to a tree structure for easier manipulation and comparison
  const convertGoJSModelToTree = () => {
    const diagram = diagramRef.current; // retrieving the diagram
    if (!diagram) return;

    const nodes = diagram.model.nodeDataArray; // all the nodes in the diagram
    const links = diagram.model.linkDataArray; // all the links in the diagram
    const nodeMap = {}; // creating a mapping for them in object form

    // each node's key is the identifier with the empty children array to be added on later
    nodes.forEach(node => {
      nodeMap[node.key] = { ...node, children: [] };
    });

    // iterating over each link and finding the parent and child node and adding child to parent if both exist 
    links.forEach(link => {
      const parentNode = nodeMap[link.from];
      const childNode = nodeMap[link.to];
      if (parentNode && childNode) {
        parentNode.children.push(childNode);
      }
    });

    // identifying the root/top most node which is that it is child of no other node
    const rootNode = nodes.find(node => !links.some(link => link.to === node.key));

    // returning tree with root node that has all its children
    return nodeMap[rootNode.key];
  };

  // function to convert the tree structure to a formatted GoJS diagram model for visualization
  const convertTreeToGoJSModel = (tree) => {
    const nodeDataArray = []; // empty array for node
    const linkDataArray = []; // empty array for link

    // recursive function to traverse the tree and build arrays for node and link data arrays
    function traverse(node, parentKey = null) {
      const key = node.name;
      node.id = key;

      nodeDataArray.push({
        key: key,
        name: node.name,
        description: node.description,
        type: node.type,
      });

      // if parent exists, then add a link
      if (parentKey) {
        linkDataArray.push({
          key: `${parentKey}-${key}`,
          from: parentKey,
          to: key,
        });
      }
      
      // traverse through the child and children if present
      if (node.child) {
        traverse(node.child, key);
      }

      if (node.children) {
        node.children.forEach((childNode) => {
          traverse(childNode, key);
        });
      }
    }

    traverse(tree);// for scenario where we are starting from root
    
    // return GoJS model format
    return { nodeDataArray, linkDataArray };
  };

  if (!treeData) {
    return <div>Loading...</div>;
  }

  const { nodeDataArray, linkDataArray } = convertTreeToGoJSModel(treeData);

  return (
    <div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName='diagram-component'
        nodeDataArray={nodeDataArray} // render the nodes
        linkDataArray={linkDataArray} // render the links
        onModelChange={handleModelChange}  // handle changes in diagram 
      />
      {hasUnsavedChanges && (
        <button onClick={saveChanges} style={{ marginTop: '10px' }}>
          Save Changes
        </button>
      )}
    </div>
  );
}

// function to format data to send back to the backend and store in the database according to the existing backend structure and schema
function convertToFormattedTree(obj, indent = 0, isRoot = true) {
    const indentation = '    '.repeat(indent); // Current level of indentation
    const nextIndent = '    '.repeat(indent + 1); // Next level of indentation

    if (typeof obj !== 'object' || obj === null) {
        return JSON.stringify(obj); // If it's not an object, return the JSON string representation
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]'; // If the array is empty, return empty array notation
        let arrayItems = obj.map(item => convertToFormattedTree(item, indent + 1, false)); // Recursively format each item
        return `[\n${nextIndent}${arrayItems.join(`,\n${nextIndent}`)}\n${indentation}]`;
    }

    let entries = [];
    for (let [key, value] of Object.entries(obj)) {
        if (key === 'key') {
            continue; // Skip 'key' property
        }

        if (key === 'type') {
            if (value === 'text') {
                entries.push(`${nextIndent}type: IntentType.TEXT`);
            } else if (value === 'selection') {
                entries.push(`${nextIndent}type: IntentType.SELECTION`);
            } else {
                entries.push(`${nextIndent}type: ${value}`);
            }
            continue;
        }

        if (key === 'children') {
            // In the root node, use 'child' instead of 'children'
            let childKey = isRoot ? 'child' : 'children';

            if (value.length > 0) {
                // For selection nodes, generate 'schema'
                let currentType = obj.type;
                if (currentType === 'selection' || currentType === 'IntentType.SELECTION') {
                    // Collect the 'name's of the children
                    let childNames = value.map(child => child.name);
                    let schema = `z.enum([${childNames.map(n => `'${n}'`).join(', ')}])`;
                    entries.push(`${nextIndent}schema: ${schema}`);
                }
                // Now process the children
                let formattedChildren;
                if (isRoot && value.length === 1) {
                    // If root and only one child, output 'child' as a single object
                    formattedChildren = convertToFormattedTree(value[0], indent + 1, false);
                } else {
                    // Otherwise, output 'children' as an array
                    formattedChildren = convertToFormattedTree(value, indent + 1, false);
                }
                entries.push(`${nextIndent}${childKey}: ${formattedChildren}`);
            }
            continue;
        }

        // For other keys
        const isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
        const formattedKey = isValidIdentifier ? key : `"${key}"`; // Remove quotes if valid identifier

        let formattedValue;
        if (typeof value === 'string') {
            formattedValue = JSON.stringify(value); // Use JSON.stringify to handle quotes and special characters
        } else {
            formattedValue = convertToFormattedTree(value, indent + 1, false);
        }
        entries.push(`${nextIndent}${formattedKey}: ${formattedValue}`);
    }

    return `{\n${entries.join(',\n')}\n${indentation}}`;
}


export default DecisionTreeDiagram;
