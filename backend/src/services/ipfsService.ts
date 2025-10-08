/**
 * IPFS Integration Service
 * Stores metadata and images on IPFS for decentralized storage
 */

import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

interface IPFSUploadResult {
  success: boolean;
  hash?: string;
  url?: string;
  error?: string;
}

interface ProjectMetadata {
  name: string;
  description: string;
  location: string;
  methodology: string;
  projectType: string;
  carbonAmount: string;
  vintageYear: number;
  images: string[];
  documents: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  attributes?: Record<string, any>;
}

class IPFSService {
  private client: IPFSHTTPClient | null;
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private usePinata: boolean;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || '';
    this.usePinata = !!this.pinataApiKey && !!this.pinataSecretKey;

    if (this.usePinata) {
      logger.info('Using Pinata for IPFS storage');
      this.client = null;
    } else {
      // Initialize IPFS client for local/Infura node
      const ipfsUrl = process.env.IPFS_URL || 'https://ipfs.infura.io:5001';
      try {
        this.client = create({ url: ipfsUrl });
        logger.info('Using IPFS node for storage');
      } catch (error) {
        logger.error('Failed to initialize IPFS client:', error);
        this.client = null;
      }
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(filePath: string): Promise<IPFSUploadResult> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);

      if (this.usePinata) {
        return await this.uploadToPinata(fileBuffer, fileName);
      } else if (this.client) {
        return await this.uploadToIPFS(fileBuffer, fileName);
      } else {
        throw new Error('No IPFS client available');
      }
    } catch (error: any) {
      logger.error('Error uploading file to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload buffer to IPFS
   */
  async uploadBuffer(buffer: Buffer, fileName: string): Promise<IPFSUploadResult> {
    try {
      if (this.usePinata) {
        return await this.uploadToPinata(buffer, fileName);
      } else if (this.client) {
        return await this.uploadToIPFS(buffer, fileName);
      } else {
        throw new Error('No IPFS client available');
      }
    } catch (error: any) {
      logger.error('Error uploading buffer to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any): Promise<IPFSUploadResult> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonString);

      if (this.usePinata) {
        return await this.uploadToPinata(buffer, 'metadata.json');
      } else if (this.client) {
        return await this.uploadToIPFS(buffer, 'metadata.json');
      } else {
        throw new Error('No IPFS client available');
      }
    } catch (error: any) {
      logger.error('Error uploading JSON to IPFS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload to IPFS node
   */
  private async uploadToIPFS(buffer: Buffer, fileName: string): Promise<IPFSUploadResult> {
    if (!this.client) {
      throw new Error('IPFS client not initialized');
    }

    try {
      const result = await this.client.add({
        path: fileName,
        content: buffer
      });

      const hash = result.cid.toString();
      const url = `https://ipfs.io/ipfs/${hash}`;

      logger.info(`File uploaded to IPFS: ${hash}`);

      return {
        success: true,
        hash,
        url
      };
    } catch (error: any) {
      logger.error('Error uploading to IPFS node:', error);
      throw error;
    }
  }

  /**
   * Upload to Pinata
   */
  private async uploadToPinata(buffer: Buffer, fileName: string): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', buffer, fileName);

      const pinataMetadata = JSON.stringify({
        name: fileName,
        keyvalues: {
          platform: 'oceara',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', pinataOptions);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`,
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey
          },
          maxBodyLength: Infinity
        }
      );

      const hash = response.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${hash}`;

      logger.info(`File uploaded to Pinata: ${hash}`);

      return {
        success: true,
        hash,
        url
      };
    } catch (error: any) {
      logger.error('Error uploading to Pinata:', error);
      throw error;
    }
  }

  /**
   * Create and upload project metadata
   */
  async uploadProjectMetadata(metadata: ProjectMetadata): Promise<IPFSUploadResult> {
    try {
      logger.info(`Uploading metadata for project: ${metadata.name}`);

      // Create metadata object following ERC-721 standard
      const tokenMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.images[0] || '',
        external_url: `https://oceara.com/projects/${metadata.name.replace(/\s+/g, '-').toLowerCase()}`,
        attributes: [
          {
            trait_type: 'Location',
            value: metadata.location
          },
          {
            trait_type: 'Methodology',
            value: metadata.methodology
          },
          {
            trait_type: 'Project Type',
            value: metadata.projectType
          },
          {
            trait_type: 'Carbon Amount',
            value: metadata.carbonAmount,
            display_type: 'number'
          },
          {
            trait_type: 'Vintage Year',
            value: metadata.vintageYear,
            display_type: 'number'
          },
          ...(metadata.attributes ? Object.entries(metadata.attributes).map(([key, value]) => ({
            trait_type: key,
            value: value
          })) : [])
        ],
        properties: {
          files: [
            ...metadata.images.map(img => ({
              uri: img,
              type: 'image'
            })),
            ...metadata.documents.map(doc => ({
              uri: doc,
              type: 'document'
            }))
          ],
          coordinates: metadata.coordinates
        }
      };

      return await this.uploadJSON(tokenMetadata);
    } catch (error: any) {
      logger.error('Error uploading project metadata:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(filePaths: string[]): Promise<{
    success: boolean;
    results: IPFSUploadResult[];
    error?: string;
  }> {
    try {
      logger.info(`Uploading ${filePaths.length} files to IPFS`);

      const uploadPromises = filePaths.map(filePath => this.uploadFile(filePath));
      const results = await Promise.all(uploadPromises);

      const allSuccessful = results.every(r => r.success);

      return {
        success: allSuccessful,
        results
      };
    } catch (error: any) {
      logger.error('Error uploading multiple files:', error);
      return {
        success: false,
        results: [],
        error: error.message
      };
    }
  }

  /**
   * Retrieve file from IPFS
   */
  async getFile(hash: string): Promise<Buffer | null> {
    try {
      if (this.client) {
        const chunks = [];
        for await (const chunk of this.client.cat(hash)) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      } else {
        // Fetch from gateway
        const response = await axios.get(`https://ipfs.io/ipfs/${hash}`, {
          responseType: 'arraybuffer'
        });
        return Buffer.from(response.data);
      }
    } catch (error) {
      logger.error('Error retrieving file from IPFS:', error);
      return null;
    }
  }

  /**
   * Retrieve JSON from IPFS
   */
  async getJSON(hash: string): Promise<any | null> {
    try {
      const buffer = await this.getFile(hash);
      if (!buffer) return null;

      const jsonString = buffer.toString('utf-8');
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('Error retrieving JSON from IPFS:', error);
      return null;
    }
  }

  /**
   * Pin file to ensure persistence
   */
  async pinFile(hash: string): Promise<boolean> {
    try {
      if (this.usePinata) {
        await axios.post(
          `https://api.pinata.cloud/pinning/pinByHash`,
          {
            hashToPin: hash,
            pinataMetadata: {
              name: `pinned-${hash}`,
              keyvalues: {
                platform: 'oceara',
                pinned: 'true'
              }
            }
          },
          {
            headers: {
              pinata_api_key: this.pinataApiKey,
              pinata_secret_api_key: this.pinataSecretKey
            }
          }
        );
        logger.info(`File pinned on Pinata: ${hash}`);
        return true;
      } else if (this.client) {
        await this.client.pin.add(hash);
        logger.info(`File pinned on IPFS: ${hash}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error pinning file:', error);
      return false;
    }
  }

  /**
   * Unpin file
   */
  async unpinFile(hash: string): Promise<boolean> {
    try {
      if (this.usePinata) {
        await axios.delete(
          `https://api.pinata.cloud/pinning/unpin/${hash}`,
          {
            headers: {
              pinata_api_key: this.pinataApiKey,
              pinata_secret_api_key: this.pinataSecretKey
            }
          }
        );
        logger.info(`File unpinned from Pinata: ${hash}`);
        return true;
      } else if (this.client) {
        await this.client.pin.rm(hash);
        logger.info(`File unpinned from IPFS: ${hash}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error unpinning file:', error);
      return false;
    }
  }

  /**
   * Get gateway URL for hash
   */
  getGatewayUrl(hash: string): string {
    if (this.usePinata) {
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return `https://ipfs.io/ipfs/${hash}`;
  }

  /**
   * Check if service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (this.usePinata) {
        const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
          headers: {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey
          }
        });
        return response.status === 200;
      } else if (this.client) {
        await this.client.id();
        return true;
      }
      return false;
    } catch (error) {
      logger.error('IPFS service not available:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  async getStatus() {
    const available = await this.isAvailable();
    return {
      available,
      provider: this.usePinata ? 'Pinata' : 'IPFS Node',
      gateway: this.usePinata ? 'https://gateway.pinata.cloud/ipfs/' : 'https://ipfs.io/ipfs/'
    };
  }
}

export default new IPFSService();

