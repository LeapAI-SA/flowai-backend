import {
    example1,
    example2,
    example3,
    example4,
  } from '../examples/example-prompts';


  export const improvePrompt = (finalRefinedDescription: string, conversationHistory: string): string => {
    return `
        Use the following steps below to generate a prompt :
          Step 1: Analyze the final refined description: "${finalRefinedDescription}".
          Step 2: Review the conversation history: "${conversationHistory}" to ensure that the prompt addresses all relevant points discussed previously.
          Step 3: Extract the relevant points from the "${conversationHistory}" as well, for example suggestions to which the user showed an affirmative intent. Add these to the prompt too. Do not add things to which the user did not responsd in an affirmative like 'yes', 'I want that' etc.
          Step 4: Validate and improve the clarity of the final refined description, checking for coherence, logical structure, and relevance based on the conversation history.
          Step 5: Generate the improved prompt from the "${finalRefinedDescription}". It should be paraphrased and made grammatically correct. 

        **Do not return "${finalRefinedDescription}" as it is.** 
        **Donot add any additional material to "${finalRefinedDescription}" apart from improving it.**

        Here are a few formatted examples to follow:
        ${example1}
        ${example2}
        ${example3}
        ${example4}

        Your response should be in JSON format and only contain a single object named improvePrompt with the value for the improved prompt.
    `;
}












