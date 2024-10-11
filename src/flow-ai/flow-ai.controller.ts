import { Body, Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException  } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FlowAiService } from './flow-ai.service';
import { DynamicFlowService } from './dynamic-flow.service';
import { getInteractionsBySession } from '../utilis/Interaction/getInteraction';
import { InjectModel } from '@nestjs/mongoose';
import { Interaction } from '../schemas/interaction.schema';
import { Model } from 'mongoose';
import { Conversation } from '../schemas/creator-conversation.schema';
import { getConversation } from '../utilis/Conversation/getConversation';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express'; // Import Express namespace
import { FilesInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as fs from 'fs';
import { lastValueFrom } from 'rxjs';

const storage = diskStorage({
  destination: './uploads', // Check if the path is correct and accessible
  filename: (req, file, callback) => {
      const extension = extname(file.originalname);
      const userId = req.body.userId || 'no-user';
      const conversationId = req.body.conversationId || 'no-conversation';
      callback(null, `${file.fieldname}-${userId}-${conversationId}-${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
  const allowedMimeTypes = ['application/pdf']; // Adjust as needed
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type'), false);
  }
};

@Controller('flow-ai') // decorates Flow AiController class handling  /flow-ai routes
export class FlowAiController {
  constructor(private readonly flowAiService: FlowAiService,
    private readonly dynamicFlowService: DynamicFlowService,
    private httpService: HttpService,
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,

  ) { }

  @Post() // handle POST requests to /flow-ai
  invokeFlowAI(@Body() body: any): any {
    return this.flowAiService.classify( // extraction of parameters
      body.sessionId,
      body.userId,
      body.treeId,
      body.query,
      body.flow_start,
      body.followup_value,
      //body.classifyFollowup ?? false, // optional with default values
      //body.lang ?? '', // optional with default values
    );
  }

@Post('create-chatbot')
@UseInterceptors(FilesInterceptor('files',10, { storage, fileFilter })) // Ensure 'file' matches the form-data key
async createDynamicChatbot(
  @UploadedFile() files: Express.Multer.File | undefined,
  @Body() body: { description: string; refinedDescription?: string; userId: string; conversationId?: string, pdfUrl?: string  },
): Promise<any> {
  let file = undefined;
  if (body.pdfUrl) {
    try {
      const response = await lastValueFrom(this.httpService.get(body.pdfUrl, { responseType: 'arraybuffer'})); // get request to url, data is binary form, last value converts into promise to use with async await
      const buffer = Buffer.from(response.data); // convert data into buffer
      const destination = './uploads';
      const filename = `files-${body.userId}-${body.conversationId}-.pdf`;
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
      const filepath = join(destination, filename);
      await writeFile(filepath, buffer); // writing data
      file = { originalname: filename, path: filepath };
    } catch (error) {
      throw new BadRequestException('Failed to download the PDF');
    }
  }

  return await this.flowAiService.createDynamicChatbot(
    body.description || '',
    body.refinedDescription || '',
    body.userId,
    body.conversationId,
    file,
  );
}

  @Get(':sessionId')
  getInteractionsBySession(@Param('sessionId') sessionId: string) {
    return getInteractionsBySession(this.interactionModel, sessionId);
  }

  @Get('conversation/:userId/:conversationId')
  async getConversation(
    @Param('userId') userId: string,
    @Param('conversationId') conversationId: string
  ) {
    return getConversation(this.conversationModel, userId, conversationId);  // Call the external function directly
  }
}
