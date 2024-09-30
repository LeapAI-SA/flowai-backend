export interface Node {
    name: string;
    description: string;
    children?: Node[];
    child?: Node;
    schema?: any; // Adjust based on your actual schema structure
    type?: string; // e.g., 'selection', 'message', etc.
}

export async function extractAllNodes(tree: Node): Promise<Node[]> {
    const nodes: Node[] = [];
    function traverse(node: Node) {
        nodes.push(node);

        if (node.children) {
            node.children.forEach(child => traverse(child));
        }

        if (node.child) {
            traverse(node.child);
        }
    }
    traverse(tree);
    return nodes;
}