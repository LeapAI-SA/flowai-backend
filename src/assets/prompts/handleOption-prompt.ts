export const handleOptionPrompt = (userInput: string, nodeDescription: string, options: string[]): string => {
    return `
    Question: ${nodeDescription}\nOptions: ${options}\nUser Input: ${userInput}\nWhich option does this input best match? Simply return the option. Donot add any sentence etc before or after. 

    It is possible that best match is not found, return 'Null' in that case.
    
    Respond with a JSON object in the following format:
      {"bestMatch": "match"}
        
    Replace "match" with the matched option or 'Null' if no option is accurately matched.
    `
}