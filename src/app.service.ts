import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService implements OnModuleInit {

  onModuleInit() {
    this.ensureUploadsDirectory();
  }

  // Function to ensure the uploads directory exists
  private ensureUploadsDirectory() {
    const uploadDir = path.join(__dirname, '..', 'uploads'); // Define the upload directory path

    // Check if the uploads directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      // console.log(`Created upload directory at ${uploadDir}`);
    } else {
      // console.log(`Upload directory already exists at ${uploadDir}`);
    }
  }

  // getHello(): string {
  //   return 'Hello World!';
  // }
}
