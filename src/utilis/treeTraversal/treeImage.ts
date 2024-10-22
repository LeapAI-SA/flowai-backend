// import { FlowTree} from '../../flow-ai/flow-ai.types';

// // Function to generate Mermaid diagram from FlowTree
// export function generateMermaidDiagram(tree: FlowTree): string { // take the FlowTrtee object as the input

//     const lines: string[] = ['graph TD']; // Start the Mermaid diagram with direction top to bottom
//     const nodeIdMap = new Map<string, number>(); // To handle duplicate node names , such as Yes No nodes
//     const definedNodes = new Set<string>(); // To keep track of node definitions, avoid duplicate definitions
  
//     function traverse(node: FlowTree, parentName?: string) { // recursive function to traverse the tree
//       // Generate unique node name
//       const baseName = sanitizeNodeName(node.name); // using helper function to generate node name
//       const count = nodeIdMap.get(baseName) || 0; // retrieves count of how many type this node has been used
//       nodeIdMap.set(baseName, count + 1); // increment of counter
//       const nodeName = count > 0 ? `${baseName}${count}` : baseName; // for count >1 append a unique number 
  
//       // check if node is not defined, add node 
//       if (!definedNodes.has(nodeName)) {
//         lines.push(`${nodeName}["${node.name}"]`); 
//         definedNodes.add(nodeName);
//       }
  
//       // Add the edge from parent to current node, meaning if node has parent add a arrow to it assigning direction
//       if (parentName) {
//         lines.push(`${parentName} --> ${nodeName}`);
//       }
  
//       // check if node has child only, traverse to it
//       if (node.child) {
//         traverse(node.child, nodeName);
//       }
  
//       // check if node has children only, traverse through each child
//       if (node.children && node.children.length > 0) {
//         node.children.forEach((child) => {
//           traverse(child, nodeName);
//         });
//       }
//     }
  
//     function sanitizeNodeName(name: string): string {
//       // Replace spaces with underscores
//       return name
//         .replace(/\s+/g, '_')
//         .replace(/[^\p{L}\p{N}_]/gu, '');
//     }
  
//     traverse(tree);
//     return lines.join('\n');
//   }
  