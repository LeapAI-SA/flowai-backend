export const checkInfoPrompt = (description: string, conversationHistory: string): string => {
    return `
        Given the "${conversationHistory}" and "${description}", please check if the description and conversation history are sufficient to create a descriptive decision tree for a chatbot with nodes, their descriptions and possible pathways.

        Analyze whether the "${description}" contains explicit information regarding the decision tree. 

        Respond with 'true' if sufficient information is present , or 'false' if very less less and irrelevant information is present.
                
        If no "${conversationHistory}" is present, then return 'false'.

        Your response should be in JSON format and only contain a single object named info with values "true" or "false".

        Example of expected JSON structure:
        {
            "info": "true"  // Replace "true" with "false" if the user wants to continue the conversation.
        }

    `;
}
