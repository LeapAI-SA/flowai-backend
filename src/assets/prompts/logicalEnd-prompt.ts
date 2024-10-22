export const logicalEndPrompt = (userInput, nodesPromise, flow_start, messages, language): string => {
    return ` 
    Given the "${userInput}" and the messages history "${messages}", please check if the user's input indicates that they are done conversing with the chatbot or do not need more information and are wanting the conversation to end. 

    Analyze whether the "${userInput}" contains explicit language that strongly suggests the user wants to **end the conversation**, such as phrases like "I am done," "That will be all," or "I don’t need any more help." Refer to the "${userInput}" and "${flow_start}" and do not interpret partial statements (e.g., "I think that is enough for **particular section**") or statements related to a specific part of the process as a request to stop the conversation. 

    Do not be very strict in deducing that the user wants to **end the conversation**.

    Once that has been established that the user wants to end the conversation, return with a generic concluding message thanking the user for contacting. Ensure that the message is in the "${language}" that is being passed

    If he wants to pursue the conversation, return 'Null'.

    Respond with a JSON object in the following format:
        {"endMessage": "message"}
        
    Replace "message" with the relevant remark or 'Null', if user intends to keep the conversation going.

        `;
}