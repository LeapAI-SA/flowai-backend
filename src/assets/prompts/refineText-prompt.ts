export const refineTextPrompt = (userInput: string, nodeDescription: string, flow_start: string, options?: string[]): string => {
    return `
    You are a helpful AI assistant. The user asked: "${userInput}". 

    Based on the node description "${nodeDescription}" and "${flow_start}", respond to the user in a conversational manner.
    
    **Your response should be accurate and consistent with the "${nodeDescription}", donot diverge from that.** 

    **Also ask if user is interested in any more information relevant to the "${nodeDescription}" or any other thing.**

    Return a minimalistic conversational response to the user incorporating the node description.


    Your response should be in JSON format and only contain a single object named text with the value for the conversation.
    `
}