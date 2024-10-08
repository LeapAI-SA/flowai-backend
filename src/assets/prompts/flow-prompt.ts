import {
    example1,
    example2,
    example3,
    example4,
  } from '../examples/example-trees';


export const flowPrompt = (description: string): string => `
    Given the description: "${description}", generate a JSON structure representing a conversational decision tree for a chatbot, adhering strictly to the following guidelines:
    
    The decision tree constructed should be relevant to the "${description}". Do not add, drop, modify or shuffle nodes other than what is passed on in the description. The tree
    should be consistent with the description and not assume things which are not specified like type of business logic.
    
    Tree Structure:
    Initiate with an initial_greeting node of type IntentType.TEXT that introduces the chatbot’s services.The initial node related to greeting should not have a schema, skip writing schema there.

    Additional Service Nodes:
    - Progress into a service_type node where users can select type of information they want.

    Node Naming and Hierarchical Layout:
    - Naming Conventions: Ensure that each node's name corresponds directly to the option it represents. For example, if an option presented to the user is "Buy a Car," the corresponding node should be named "Buy a Car". Do not name nodes with underscores or Hyphens etc within them.
    - Nested Structure: Nodes should be nested within each other to reflect the hierarchy of choices. Parent nodes present broad categories, and child nodes delve into more specific options based on previous selections.
    - Ensure Intermediate Nodes always have a child node.
    - Every node in the tree with type selection should have children nodes for the options it is specifying.
    - Ensure that the initial greeting node has a **child node** which can then possibly have **children nodes** for the options to display to user.

    Node Specifications:
    - Each node in the tree should include:
        - name: A unique identifier for the node.
        - type: Should be one of the specified IntentType values (IntentType.TEXT, IntentType.SELECTION, or IntentType.INTERMEDIATE).
        - description: Text that explains the node's purpose or prompts the user for input.
        - schema: Validation rules using Zod, applicable for input validation. Use z.enum([...]) for selection nodes to list available options, and z.string() for text input nodes to ensure that some input is provided.
    
        - Nodes designed to capture user input or choices should lead to subsequent nodes based on the user's response.

    End of Interaction:
    -Conclude the branches of tree whether service, portfolio or any with a final IntentType.TEXT node concluding the chat and assuring user that they will be contacted soon by someone relevant.
    
    Dynamic Interaction Management:
    - Ensure that the decision tree can handle multiple user interactions under a single query, updating the internal state or follow-up actions as required based on user inputs.

    Constraints:
    - Only use the allowed object properties: name, type, description, schema, child, and children.
    - Do not add any fields not specified above, such as external links or unnecessary metadata.
    - Our goal is to provide information rather than extracting it, so nodes gathering user details such as name, email are not required.

    Objective: The objective is to construct an informative decision tree that is intuitive and user-centric, guiding the user through a series of information that correspond to their initial and subsequent choices. 
    
    Here are a few formatted examples to follow:

    ${example1}
    ${example2}
    ${example3}
    ${example4}
`
















