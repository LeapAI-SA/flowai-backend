export interface Interaction {
    aiResponse: string;
    followupValue?: string;
    query?: string;
}

export interface Message {
    role: string;
    content: string;
}

export function buildMessages(interactions: Interaction[], lastUserInput: string): Message[] {
    let messages: Message[] = [];
    interactions.forEach(interaction => {
        // Use interaction's followupValue or query as the user's message
        const userMessage = interaction.followupValue || interaction.query;
        if (userMessage) {
            messages.push({ role: 'user', content: userMessage });
        }
        // Push AI's response
        messages.push({ role: 'system', content: interaction.aiResponse });
    });
    // Optionally, add the last user's input if it's not already included
    if (lastUserInput && (interactions.length === 0 || interactions[interactions.length - 1].followupValue !== lastUserInput)) {
        messages.push({ role: 'user', content: lastUserInput });
    }
    return messages;
}

