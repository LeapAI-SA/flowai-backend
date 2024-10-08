export const userDonePrompt = (description: string, conversationHistory: string): string => {
    return `
        Given the "${conversationHistory}" and "${description}", please check if the user's input indicates that they are done providing information or do not need more help and are wanting the conversation to end. 

        Analyze whether the "${description}" contains explicit language that strongly suggests the user wants to **end the conversation**, such as phrases like "I am done," "That will be all," or "I don’t need any more help." Refer to the "${conversationHistory}" and do not interpret partial statements (e.g., "I think that is enough for **particular section**") or statements related to a specific part of the process as a request to stop the conversation.

        Respond with 'true' if they want to stop, or 'false' if they intend on continuing the conversation.
                
        If no "${conversationHistory}" is present, then do not attempt to complete the conversation and return false.

        Your response should be in JSON format and only contain a single object named isDone with values "true" or "false".

        Example of expected JSON structure:
        {
            "isDone": "true"  // Replace "true" with "false" if the user wants to continue the conversation.
        }

    `;
}