export const confirmEndOrContinuePrompt = (
    description: string,
    conversationHistory: string
): string => {
    return `
    The question being asked to the user is **"Do you have any further information you would like to provide to help with building your chatbot?"**
    
    - Based on the "${description}" which is the user's response to this question, determine whether the input indicates that they are done providing information, do not need more help, and want the conversation to end.
    
    Specifically, analyze whether the "${description}" contains negative or remotely dismissive language that suggests the user wants to **end the conversation**. This includes phrases such as:
    - "No"
    - "I'm done"
    - "That will be all"
    - "I don't need more help"
    - "I think that's enough"
    - "No more"
    - "Enough"
    - "Not now"
    - "Nothing else" 
    - "I'm fine"
    - Any other variations or similar phrases that suggest the user does not want to continue the conversation.

    If any of the above or similar language is detected, return 'true', indicating that the user wants to stop.

    On the other hand, if the user's response contains phrases like:
    - "Yes"
    - "I have more information"
    - "Let me add more"
    - "I have something else"
    - Or any other indication that they wish to continue providing input, return 'false'.

    For **irrelevant or vague inputs** (such as "hmm", "okay", "maybe", unrelated topics, or unclear responses), assume the user might still have more to say or clarify. Therefore, treat them as an indication to **continue the conversation**, and return 'false'.
    
    Respond with 'true' if they want to stop, or 'false' if they intend to continue.

    Your response should be in JSON format and contain only a single object named "end" with values "true" or "false".

    Example of expected JSON structure:
    {
        "end": "true"  // Replace "true" with "false" if the user wants to continue the conversation.
    }
    `;
};
