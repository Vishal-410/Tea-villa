import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { uploadToCloudinary } from 'src/common/utils/cloudinary';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');

    const result = await uploadToCloudinary(file.buffer, 'teaVilla');

    return { url: result.secure_url };
  }
}
