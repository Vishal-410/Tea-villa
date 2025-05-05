import { v2 as cloudinary } from 'cloudinary';
import { PassThrough } from 'stream';

cloudinary.config({
  cloud_name: 'dscsbixa2',
  api_key: '395229328523777',
  api_secret: 'ajrEXCStCcRy8sA6I-hZb-Qa4AQ',
});

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve(result);
      }
    );
    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(stream);
  });
};

export default cloudinary;
