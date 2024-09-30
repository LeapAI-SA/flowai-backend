import { Injectable } from '@nestjs/common';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { formatDocumentsAsString } from 'langchain/util/document';
import { PromptTemplate } from '@langchain/core/prompts';
import {
  RunnableSequence,
  RunnablePassthrough,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { LanguageDetectorService } from 'src/language-detector/language-detector.service';

@Injectable()
export class FaqService {
  constructor(
    private readonly languageDetectorService: LanguageDetectorService,
  ) {}

  async queryFAQ(question: string, collection: string) {
    const model = new ChatOpenAI({
      model: 'gpt-4',
      temperature: 0,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      new OpenAIEmbeddings(),
      {
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: collection,
        url: process.env.QDRANT_URL,
      },
    );
    const retriever = vectorStore.asRetriever();

    const prompt = PromptTemplate.fromTemplate(`Answer the question in ${
      this.languageDetectorService.detectLanguage(question).name
    } based only on the following context:
      {context}
      
      NOTE: if no answer is found, please respond with "N/A"
      
      Question: {question}
      
      Answer: `);

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(question);

    return result;

    /*
  "The powerhouse of the cell is the mitochondria."
*/
  }
}
