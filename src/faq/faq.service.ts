import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { OpenAI } from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFExtract } from 'pdf.js-extract';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';

const pdfExtract = new PDFExtract();
const options = {};

@Injectable()
export class FaqService {

  
  private qdrantClient: QdrantClient;
  private collectionName = 'Flow-AI-TEST';

  constructor(private aiModel: OpenAI,
    private readonly languageDetectorService: LanguageDetectorService,

  ) {
    this.qdrantClient = new QdrantClient({
      apiKey: process.env.QDRANT_API_KEY,
      url: process.env.QDRANT_URL,
    });
    
  }

  async initializeCollection() {
    const collections = await this.qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
      (c) => c.name === this.collectionName,
    );

    if (!collectionExists) {
      await this.qdrantClient.createCollection(this.collectionName, {
        vectors: {
          size: 3072, // Embedding vector size (e.g., OpenAI embeddings)
          distance: 'Cosine',
        },
      });
    } else {
    }
  }

  async extractTextFromPDF(pdfPath: string, lang: string = 'en'): Promise<string> {
    return new Promise((resolve, reject) => {
        pdfExtract.extract(pdfPath, options, async (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            let fullText = '';
            let prevY = null; // Keep track of the previous item's y-coordinate

            // Process each page and each content item
            data.pages.forEach((page) => {
                page.content.forEach((item, index) => {
                    // Add a space between words
                    if (index > 0) {
                        const prevItem = page.content[index - 1];
                        const spaceBetweenWords = item.x - (prevItem.x + prevItem.width);
                        if (spaceBetweenWords > 5) {
                            fullText += ' '; // Add space if items are far apart horizontally
                        }
                    }

                    // Detect new paragraphs based on y-coordinate difference
                    if (prevY !== null && Math.abs(item.y - prevY) > 10) {
                        fullText += '\n'; // Add newline for new paragraph
                    }

                    fullText += item.str;
                    prevY = item.y; // Update previous y-coordinate
                });

                fullText += '\n\n'; // Add two newlines between pages for clarity
            });
            let formattedText = fullText
            // Detect language
            try {
                let detectedLang = await this.languageDetectorService.detectLanguage(fullText);
                
                // Apply language-specific formatting based on detected language
                if (detectedLang.code === 'en') {
                    // English-specific formatting
                    formattedText = formattedText
                        .replace(/(\w+)-\n(\w+)/g, '$1$2')  // Rejoin hyphenated words
                        .replace(/(?<!\.)\n(?!\n)/g, ' ');  // Join lines that are part of the same sentence
                } else if (detectedLang.code === 'ar') {
                    // Arabic-specific formatting
                    formattedText = formattedText
                        .replace(/(\w+)-\n(\w+)/g, '$1$2')  // Rejoin hyphenated words (Arabic context)
                        .replace(/(?<!\.)\n(?!\n)/g, ' ');  // Join lines that are part of the same sentence
                }

                // Further cleaning: remove excess whitespace and ensure readability
                formattedText = formattedText
                    .replace(/\n\s+/g, '\n')    // Remove extra spaces at start of lines
                    .replace(/\n+/g, '\n\n');   // Ensure paragraphs are separated by double newlines
                resolve(formattedText);
            } catch (langError) {
                reject(langError); // Handle any error from the language detection service
            }
        });
    });
}


  async chunkText(text: string, maxChunkSize: number = 512): Promise<string[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: maxChunkSize,
      chunkOverlap: 50,
    });
    return await textSplitter.splitText(text);
  }

  async addChunksToVectorStore(chunks: string[], treeId: string, userId:string ) {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-large',
    });
    const metadata = chunks.map(() => ({
      tree_id: treeId,
      user_id: userId,
    }));

    await QdrantVectorStore.fromTexts(
      chunks,
      metadata,
      embeddings,
      {
        apiKey: process.env.QDRANT_API_KEY,
        url: process.env.QDRANT_URL,
        collectionName: this.collectionName,
      },
    );
  }

  async checkRelevance(question: string, context: string, retries: number = 2, delay: number = 5000): Promise<number> {
    const prompt = `Context: "${context}"
                    Question: "${question}"
                    Assign a relevance score in the range 0-1 where 1 means completely relevant and 0 means not relevant. 
                    Consider both semantic and conceptual matches, even if the wording is slightly different. 
                    If the "${context}" is missing, assign a score of 0.
                    Do not give more relevance to incomplete matches or completely irrelevant information.
                    Your response should be in JSON format with an object named 'score'.`;
  
    try {
      const response =  await this.aiModel.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });

      const aiResponse =  response.choices[0].message.content.trim();
      const aiResponseCleaned = aiResponse

        .replace(/```json\n?/g, '')
        .replace(/\n?```/g, '')
        .trim();
      const parsedResponse = JSON.parse(aiResponseCleaned);

      if (!('score' in parsedResponse)) {
        throw new Error("Score is missing from the AI response.");
      }
      return parsedResponse.score;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.checkRelevance(question, context,retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }

  async getContext(question: string, treeId: string): Promise<{ question: string; context: string }> {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-large', 
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: this.collectionName,
        url: process.env.QDRANT_URL,
      },
    );
    const retriever = vectorStore.asRetriever({
      k: 1,
      filter: {
        must: [
          {
            key:'metadata.tree_id',
            match: {
              value: treeId,
            },
          },
        ],
      },
    });
    const contextDocs = await retriever.invoke(question);
    const context = contextDocs.map((doc) => doc.pageContent).join(' ');
    return { question, context };
  }

  async relevanceFilter(question: string, context: string): Promise<boolean> {
    const score = await this.checkRelevance(question, context);
    return score > 0.7;
  }

  async generateAnswer(question: string, context: string, language, retries: number = 2, delay: number = 5000): Promise<string> {
    const prompt = `Question: ${question}
  Context: ${context}
  Language : ${language}
  Please answer the question relevant to the context. If the question is not relevant to the context, respond with a generic short message citing your inability to answer irrelevant questions. Your answer should be in the language passed.`;
  
    try {
      const response =  await this.aiModel.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
  
      const answer =  response.choices[0].message.content.trim();
      return answer.trim();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.generateAnswer(question, context,retries - 1, delay);
    }
    else{
      throw new Error(`Original error: ${error.message}`);
    }
  }
  }
  
  async ragChain(question: string, treeId: string, language): Promise<string> {
    const contextData = await this.getContext(question, treeId);
    const isRelevant = await this.relevanceFilter(contextData.question, contextData.context);

    if (isRelevant) {
      return await this.generateAnswer(contextData.question, contextData.context, language);
    } else {
      return "I'm sorry, but I cannot answer questions that are not relevant to the provided context.";
    }
  }

  async processPDFandAddToCollection(pdfPath: string, treeId: string, userId: string) {
    await this.initializeCollection();

    const text = await this.extractTextFromPDF(pdfPath);
    const chunks = await this.chunkText(text);
    await this.addChunksToVectorStore(chunks, treeId, userId);
  }
}
