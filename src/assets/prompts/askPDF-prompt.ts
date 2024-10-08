export const askForPDFPrompt = (
    conversationHistory: string
  ): string => {
    return `
    - Based on the conversation history "${conversationHistory}", it seems the user is done. Ask him whether he has a PDF document or furthher information to provide to you.

    - Your response should be in JSON format with a "message" field containing the prompt to the user.
    
    **Example JSON:**
    {
      "message": "Do you have a PDF document or any further information you would like to provide before we conclude this conversation?"
    }
    `;
  };
  