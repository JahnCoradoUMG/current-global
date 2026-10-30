import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');

    this.configured = Boolean(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; mediaType: string }> {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Set CLOUDINARY_* env vars.',
      );
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only image/jpeg, image/png and image/webp are allowed',
      );
    }

    if (file.size > MAX_BYTES) {
      throw new BadRequestException('File size must be <= 5 MB');
    }

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'current-global/posts' },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Cloudinary upload failed'));
              return;
            }
            resolve(uploaded as { secure_url: string });
          },
        );
        Readable.from(file.buffer).pipe(stream);
      },
    );

    return { url: result.secure_url, mediaType: 'image' };
  }
}
