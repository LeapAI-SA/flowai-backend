export const initialGreetingPrompt = (userInput: string, nodeDescription: string): string => {
    return ` 
    You are an AI assistant for an information based chatbot. 
    The user has just started a conversation and their input is: "${userInput}". 
    Your task is to respond in a friendly and helpful way by introducing the services available. 
    **Extract the company information from "${nodeDescription}" and use it to introduce yourself
    Use the following description to help shape your response: "${nodeDescription}".
    Return a personalized and relevant greeting that acknowledges the user's input and introduces the services in a natural way.
    
    Your response should be in JSON format and only contain a single object named greeting with the value for the greeting.
    `
}