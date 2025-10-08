/**
 * File Storage Service
 * Handles file uploads to AWS S3, Google Cloud Storage, or Azure Blob
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import Upload from '../models/Upload';
import mongoose from 'mongoose';

interface UploadOptions {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  uploadType: 'drone_image' | 'field_data' | 'gps_data' | 'before_after_photo' | 'document' | 'report' | 'other';
  userRole: 'landowner' | 'admin' | 'buyer' | 'verifier';
  metadata?: any;
  isPublic?: boolean;
}

interface UploadResult {
  uploadId: string;
  filename: string;
  url: string;
  key: string;
  size: number;
  uploadRecord: any;
}

class FileStorageService {
  private provider: 'aws_s3' | 'google_cloud' | 'azure_blob';
  private s3Client?: S3Client;
  private gcStorage?: Storage;
  private azureBlobService?: BlobServiceClient;
  private bucket: string;

  constructor() {
    this.provider = (process.env.STORAGE_PROVIDER as any) || 'aws_s3';
    this.bucket = process.env.STORAGE_BUCKET || 'oceara-uploads';
    
    this.initializeProvider();
  }

  /**
   * Initialize storage provider
   */
  private initializeProvider() {
    try {
      switch (this.provider) {
        case 'aws_s3':
          this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
          });
          logger.info('AWS S3 storage initialized');
          break;

        case 'google_cloud':
          this.gcStorage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            keyFilename: process.env.GCP_KEY_FILE
          });
          logger.info('Google Cloud Storage initialized');
          break;

        case 'azure_blob':
          this.azureBlobService = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING || ''
          );
          logger.info('Azure Blob Storage initialized');
          break;

        default:
          throw new Error(`Unsupported storage provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('Failed to initialize storage provider:', error);
      throw error;
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: Express.Multer.File | Buffer,
    options: UploadOptions
  ): Promise<UploadResult> {
    const uploadId = uuidv4();
    const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
    const originalFilename = Buffer.isBuffer(file) ? 'upload' : file.originalname;
    const fileType = Buffer.isBuffer(file) ? 'application/octet-stream' : file.mimetype;
    const fileSize = fileBuffer.length;
    const fileExtension = path.extname(originalFilename);
    
    // Generate unique filename
    const filename = this.generateFilename(originalFilename, uploadId);
    const key = this.generateKey(options.uploadType, options.userId.toString(), filename);

    try {
      // Upload to storage provider
      const url = await this.uploadToProvider(key, fileBuffer, fileType, options.isPublic);

      // Create upload record in database
      const uploadRecord = await Upload.create({
        uploadId,
        originalFilename,
        filename,
        fileType,
        fileExtension,
        fileSize,
        uploadType: options.uploadType,
        userId: options.userId,
        projectId: options.projectId,
        userRole: options.userRole,
        storage: {
          provider: this.provider,
          bucket: this.bucket,
          key,
          region: process.env.AWS_REGION || process.env.GCP_REGION,
          url
        },
        processingStatus: {
          uploaded: true,
          validated: false,
          scanned: false,
          processed: false,
          indexed: false
        },
        metadata: options.metadata || {},
        security: {
          virusScanStatus: 'pending',
          encrypted: false,
          accessLevel: options.isPublic ? 'public' : 'private'
        },
        permissions: {
          public: options.isPublic || false
        },
        usage: {
          downloads: 0,
          views: 0
        },
        status: 'uploaded',
        uploadStarted: new Date(),
        uploadCompleted: new Date()
      });

      logger.info(`File uploaded successfully: ${uploadId}`);

      return {
        uploadId,
        filename,
        url,
        key,
        size: fileSize,
        uploadRecord
      };
    } catch (error) {
      logger.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload to specific provider
   */
  private async uploadToProvider(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic: boolean = false
  ): Promise<string> {
    switch (this.provider) {
      case 'aws_s3':
        return this.uploadToS3(key, buffer, contentType, isPublic);
      
      case 'google_cloud':
        return this.uploadToGCS(key, buffer, contentType, isPublic);
      
      case 'azure_blob':
        return this.uploadToAzure(key, buffer, contentType, isPublic);
      
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic: boolean
  ): Promise<string> {
    if (!this.s3Client) throw new Error('S3 client not initialized');

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private',
      ServerSideEncryption: 'AES256'
    });

    await this.s3Client.send(command);

    // Generate URL
    if (isPublic) {
      return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } else {
      // Generate signed URL (valid for 1 hour)
      const getCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });
      return await getSignedUrl(this.s3Client, getCommand, { expiresIn: 3600 });
    }
  }

  /**
   * Upload to Google Cloud Storage
   */
  private async uploadToGCS(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic: boolean
  ): Promise<string> {
    if (!this.gcStorage) throw new Error('GCS client not initialized');

    const bucket = this.gcStorage.bucket(this.bucket);
    const file = bucket.file(key);

    await file.save(buffer, {
      contentType,
      public: isPublic,
      metadata: {
        contentType
      }
    });

    if (isPublic) {
      return `https://storage.googleapis.com/${this.bucket}/${key}`;
    } else {
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 3600 * 1000 // 1 hour
      });
      return signedUrl;
    }
  }

  /**
   * Upload to Azure Blob Storage
   */
  private async uploadToAzure(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic: boolean
  ): Promise<string> {
    if (!this.azureBlobService) throw new Error('Azure Blob client not initialized');

    const containerClient = this.azureBlobService.getContainerClient(this.bucket);
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });

    return blockBlobClient.url;
  }

  /**
   * Get signed URL for private file
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    switch (this.provider) {
      case 'aws_s3':
        if (!this.s3Client) throw new Error('S3 client not initialized');
        const command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key
        });
        return await getSignedUrl(this.s3Client, command, { expiresIn });

      case 'google_cloud':
        if (!this.gcStorage) throw new Error('GCS client not initialized');
        const bucket = this.gcStorage.bucket(this.bucket);
        const file = bucket.file(key);
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + expiresIn * 1000
        });
        return signedUrl;

      case 'azure_blob':
        if (!this.azureBlobService) throw new Error('Azure Blob client not initialized');
        const containerClient = this.azureBlobService.getContainerClient(this.bucket);
        const blockBlobClient = containerClient.getBlockBlobClient(key);
        // Azure SAS token generation would go here
        return blockBlobClient.url;

      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      switch (this.provider) {
        case 'aws_s3':
          if (!this.s3Client) throw new Error('S3 client not initialized');
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key
          }));
          break;

        case 'google_cloud':
          if (!this.gcStorage) throw new Error('GCS client not initialized');
          await this.gcStorage.bucket(this.bucket).file(key).delete();
          break;

        case 'azure_blob':
          if (!this.azureBlobService) throw new Error('Azure Blob client not initialized');
          const containerClient = this.azureBlobService.getContainerClient(this.bucket);
          await containerClient.getBlockBlobClient(key).delete();
          break;
      }

      logger.info(`File deleted: ${key}`);
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'aws_s3':
          if (!this.s3Client) throw new Error('S3 client not initialized');
          await this.s3Client.send(new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key
          }));
          return true;

        case 'google_cloud':
          if (!this.gcStorage) throw new Error('GCS client not initialized');
          const [exists] = await this.gcStorage.bucket(this.bucket).file(key).exists();
          return exists;

        case 'azure_blob':
          if (!this.azureBlobService) throw new Error('Azure Blob client not initialized');
          const containerClient = this.azureBlobService.getContainerClient(this.bucket);
          return await containerClient.getBlockBlobClient(key).exists();

        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalFilename: string, uploadId: string): string {
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    return `${sanitized}_${timestamp}_${uploadId.substring(0, 8)}${ext}`;
  }

  /**
   * Generate S3/Cloud key
   */
  private generateKey(uploadType: string, userId: string, filename: string): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `uploads/${year}/${month}/${uploadType}/${userId}/${filename}`;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to upload file ${file.originalname}:`, error);
        // Continue with other files
      }
    }
    
    return results;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(uploadId: string) {
    return await Upload.findOne({ uploadId });
  }

  /**
   * Update file processing status
   */
  async updateProcessingStatus(
    uploadId: string,
    status: Partial<{
      validated: boolean;
      scanned: boolean;
      processed: boolean;
      indexed: boolean;
    }>
  ) {
    return await Upload.findOneAndUpdate(
      { uploadId },
      { $set: { processingStatus: status } },
      { new: true }
    );
  }
}

export default new FileStorageService();
