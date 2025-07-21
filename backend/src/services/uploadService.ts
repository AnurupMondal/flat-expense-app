import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface FileValidationResult {
  clean: boolean;
  threat?: string;
  signature?: string;
}

export interface SignedUrlOptions {
  expirationTime?: number; // in seconds
  userId?: string;
  permissions?: string[];
}

class FileValidationService {
  static readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  static readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  
  static validateMimeType(mimetype: string): boolean {
    return this.allowedMimeTypes.includes(mimetype);
  }
  
  static validateFileSize(size: number): boolean {
    return size <= this.maxFileSize;
  }
  
  /**
   * Stub virus scanner - in production, integrate with ClamAV or similar
   */
  static async virusScan(filePath: string): Promise<FileValidationResult> {
    const filename = path.basename(filePath);
    
    // Simulate virus detection for testing
    if (filename.toLowerCase().includes('virus') || filename.toLowerCase().includes('malware')) {
      return {
        clean: false,
        threat: 'Test.Virus.Mock',
        signature: crypto.createHash('md5').update(filePath).digest('hex')
      };
    }
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      clean: true,
      signature: crypto.createHash('md5').update(filePath).digest('hex')
    };
  }
}

class S3Service {
  /**
   * Generate signed URL for secure file access
   */
  static generateSignedUrl(
    fileKey: string, 
    options: SignedUrlOptions = {}
  ): string {
    const { expirationTime = 3600, userId, permissions = ['read'] } = options;
    const expires = Date.now() + (expirationTime * 1000);
    
    // Create signature based on file key, expiration, and secret
    const stringToSign = `${fileKey}:${expires}:${userId || 'anonymous'}:${permissions.join(',')}`;
    const signature = crypto
      .createHmac('sha256', process.env.FILE_SIGNING_SECRET || 'default-secret')
      .update(stringToSign)
      .digest('hex');
    
    const baseUrl = process.env.FILE_BASE_URL || 'https://localhost:3000/api/files';
    return `${baseUrl}/${fileKey}?expires=${expires}&signature=${signature}&user=${userId || 'anonymous'}&perms=${permissions.join(',')}`;
  }
  
  /**
   * Validate signed URL
   */
  static validateSignedUrl(url: string): { valid: boolean; expired?: boolean; reason?: string } {
    try {
      const urlObj = new URL(url);
      const expires = parseInt(urlObj.searchParams.get('expires') || '0');
      const signature = urlObj.searchParams.get('signature');
      const user = urlObj.searchParams.get('user') || 'anonymous';
      const perms = urlObj.searchParams.get('perms') || 'read';
      
      const now = Date.now();
      
      if (expires < now) {
        return { valid: false, expired: true, reason: 'URL expired' };
      }
      
      if (!signature) {
        return { valid: false, reason: 'Missing signature' };
      }
      
      // Extract file key from URL path
      const fileKey = urlObj.pathname.split('/').pop();
      if (!fileKey) {
        return { valid: false, reason: 'Invalid file key' };
      }
      
      // Recreate signature for validation
      const stringToSign = `${fileKey}:${expires}:${user}:${perms}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.FILE_SIGNING_SECRET || 'default-secret')
        .update(stringToSign)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: `Parse error: ${(error as Error).message}` };
    }
  }
}

class UploadService {
  private static uploadsDir = path.join(process.cwd(), 'uploads');
  private static privateDir = path.join(this.uploadsDir, 'private');
  
  static {
    // Ensure directories exist
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.privateDir)) {
      fs.mkdirSync(this.privateDir, { recursive: true });
    }
  }
  
  /**
   * Create multer configuration with security checks
   */
  static createMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        // Store in private folder for authenticated users
        const isPrivate = req.body.private === 'true';
        const dest = isPrivate ? this.privateDir : this.uploadsDir;
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with user ID prefix if available
        const userId = (req as any).user?.userId || 'anonymous';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${uniqueSuffix}${ext}`);
      },
    });
    
    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Validate MIME type
      if (!FileValidationService.validateMimeType(file.mimetype)) {
        return cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
      }
      
      cb(null, true);
    };
    
    return multer({
      storage,
      fileFilter,
      limits: { 
        fileSize: FileValidationService.maxFileSize,
        files: 5 // Maximum 5 files per request
      },
    });
  }
  
  /**
   * Post-upload processing with virus scan
   */
  static async processUploadedFile(filePath: string) {
    // Perform virus scan
    const scanResult = await FileValidationService.virusScan(filePath);
    
    if (!scanResult.clean) {
      // Delete infected file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`File rejected: ${scanResult.threat}`);
    }
    
    return {
      clean: scanResult.clean,
      signature: scanResult.signature,
      path: filePath
    };
  }
  
  /**
   * Get file with access control
   */
  static async getFile(filename: string, userId?: string, signedUrl?: string) {
    const publicPath = path.join(this.uploadsDir, filename);
    const privatePath = path.join(this.privateDir, filename);
    
    // Check if file exists in public directory first
    if (fs.existsSync(publicPath)) {
      return {
        path: publicPath,
        isPrivate: false,
        requiresAuth: false
      };
    }
    
    // Check private directory
    if (fs.existsSync(privatePath)) {
      // Require authentication for private files
      if (!userId && !signedUrl) {
        throw new Error('Authentication required for private file');
      }
      
      // Validate signed URL if provided
      if (signedUrl) {
        const validation = S3Service.validateSignedUrl(signedUrl);
        if (!validation.valid) {
          throw new Error(`Invalid signed URL: ${validation.reason}`);
        }
      }
      
      // Check if user owns the file (filename starts with userId)
      if (userId && !filename.startsWith(userId + '-')) {
        throw new Error('Access denied: file does not belong to user');
      }
      
      return {
        path: privatePath,
        isPrivate: true,
        requiresAuth: true
      };
    }
    
    throw new Error('File not found');
  }
}

export { FileValidationService, S3Service, UploadService };
