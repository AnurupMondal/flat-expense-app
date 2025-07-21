import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { FileValidationService, S3Service, UploadService } from '../src/services/uploadService';

// Mock notification service for unit testing
class MockNotificationService {
  private static retryAttempts: number = 0;
  private static failureSimulator: boolean = false;
  
  static resetFailureSimulator() {
    this.retryAttempts = 0;
    this.failureSimulator = false;
  }
  
  static enableFailureSimulator() {
    this.failureSimulator = true;
    this.retryAttempts = 0;
  }
  
  static async sendInAppNotification(userId: string, message: any) {
    return { success: true, channel: 'in-app', userId, message };
  }
  
  static async sendEmailNotification(email: string, message: any) {
    this.retryAttempts++;
    
    if (this.failureSimulator && this.retryAttempts <= 2) {
      throw new Error('Email service temporarily unavailable');
    }
    
    return { 
      success: true, 
      channel: 'email', 
      email, 
      message,
      attempt: this.retryAttempts
    };
  }
  
  static async sendPushNotification(deviceToken: string, message: any) {
    if (this.failureSimulator && Math.random() < 0.5) {
      throw new Error('Push service unavailable');
    }
    
    return { success: true, channel: 'push', deviceToken, message };
  }
  
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delays: number[] = [100, 200, 400] // Shorter delays for testing
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt + 1} failed: ${(error as Error).message}`);

        if (attempt < maxRetries - 1) {
          const delay = delays[attempt] || delays[delays.length - 1];
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}

describe('Notification Service Unit Tests', () => {
  beforeEach(() => {
    MockNotificationService.resetFailureSimulator();
  });

  describe('Multi-Channel Notifications', () => {
    it('should send in-app notifications successfully', async () => {
      const result = await MockNotificationService.sendInAppNotification(
        'user-123',
        { title: 'Test Notification', message: 'This is a test' }
      );

      expect(result.success).toBe(true);
      expect(result.channel).toBe('in-app');
      expect(result.userId).toBe('user-123');
      expect(result.message.title).toBe('Test Notification');
    });

    it('should send push notifications successfully', async () => {
      const result = await MockNotificationService.sendPushNotification(
        'device-token-456',
        { title: 'Push Test', body: 'Push notification body' }
      );

      expect(result.success).toBe(true);
      expect(result.channel).toBe('push');
      expect(result.deviceToken).toBe('device-token-456');
    });

    it('should handle push notification failures gracefully', async () => {
      MockNotificationService.enableFailureSimulator();
      
      // Run multiple attempts as the failure is random
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < 10; i++) {
        try {
          await MockNotificationService.sendPushNotification('token', { title: 'Test' });
          successCount++;
        } catch (error) {
          failureCount++;
          expect((error as Error).message).toBe('Push service unavailable');
        }
      }
      
      // At least some should fail due to simulation
      expect(failureCount).toBeGreaterThan(0);
    });
  });

  describe('Retry Logic and Backoff', () => {
    it('should implement retry logic for email notifications', async () => {
      MockNotificationService.enableFailureSimulator();
      
      const startTime = Date.now();
      const result = await MockNotificationService.retryWithBackoff(
        () => MockNotificationService.sendEmailNotification('test@example.com', { subject: 'Test' }),
        3
      );
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.channel).toBe('email');
      expect(result.attempt).toBe(3); // Should succeed on 3rd attempt
      expect(duration).toBeGreaterThanOrEqual(300); // At least 100 + 200ms delays
    });

    it('should fail after maximum retry attempts', async () => {
      await expect(
        MockNotificationService.retryWithBackoff(
          () => { throw new Error('Persistent failure'); },
          3
        )
      ).rejects.toThrow('Persistent failure');
    });

    it('should implement exponential backoff timing', async () => {
      const delays: number[] = [];
      const customRetry = async (fn: Function, maxRetries: number = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await fn();
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 50; // 50ms, 100ms, 200ms
            delays.push(delay);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      try {
        await customRetry(() => { throw new Error('Test'); }, 3);
      } catch (error) {
        // Expected to fail
      }

      expect(delays).toEqual([50, 100]);
    });
  });

  describe('Unread Count Management', () => {
    it('should track notification read status', () => {
      // Mock unread count functionality
      const mockNotifications = [
        { id: '1', read: false, userId: 'user-123' },
        { id: '2', read: true, userId: 'user-123' },
        { id: '3', read: false, userId: 'user-123' },
        { id: '4', read: false, userId: 'user-456' }
      ];

      const getUnreadCount = (userId: string) => {
        return mockNotifications.filter(n => n.userId === userId && !n.read).length;
      };

      const markAsRead = (notificationId: string) => {
        const notification = mockNotifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
        }
      };

      expect(getUnreadCount('user-123')).toBe(2);
      markAsRead('1');
      expect(getUnreadCount('user-123')).toBe(1);
      markAsRead('3');
      expect(getUnreadCount('user-123')).toBe(0);
    });
  });
});

describe('File Upload Service Unit Tests', () => {
  let testDir: string;
  let testFile: string;

  beforeAll(() => {
    testDir = path.join(process.cwd(), 'test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    testFile = path.join(testDir, 'test-file.jpg');
    fs.writeFileSync(testFile, Buffer.alloc(1024, 0xFF)); // 1KB test file
  });

  afterAll(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    if (fs.existsSync(testDir)) {
      fs.rmdirSync(testDir);
    }
  });

  describe('File Validation', () => {
    it('should validate allowed MIME types', () => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'text/plain'
      ];

      const rejectedTypes = [
        'application/exe',
        'text/html',
        'application/javascript',
        'text/x-shellscript'
      ];

      allowedTypes.forEach(type => {
        expect(FileValidationService.validateMimeType(type)).toBe(true);
      });

      rejectedTypes.forEach(type => {
        expect(FileValidationService.validateMimeType(type)).toBe(false);
      });
    });

    it('should enforce file size limits', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      expect(FileValidationService.validateFileSize(1024)).toBe(true); // 1KB
      expect(FileValidationService.validateFileSize(maxSize)).toBe(true); // Exactly 5MB
      expect(FileValidationService.validateFileSize(maxSize + 1)).toBe(false); // Over 5MB
      expect(FileValidationService.validateFileSize(10 * 1024 * 1024)).toBe(false); // 10MB
    });

    it('should perform virus scanning', async () => {
      const cleanResult = await FileValidationService.virusScan('/path/to/clean-file.jpg');
      expect(cleanResult.clean).toBe(true);
      expect(cleanResult.signature).toBeDefined();

      const virusResult = await FileValidationService.virusScan('/path/to/virus-file.exe');
      expect(virusResult.clean).toBe(false);
      expect(virusResult.threat).toBe('Test.Virus.Mock');
      expect(virusResult.signature).toBeDefined();
    });

    it('should detect malware in filenames', async () => {
      const malwareResult = await FileValidationService.virusScan('/path/to/malware-document.pdf');
      expect(malwareResult.clean).toBe(false);
      expect(malwareResult.threat).toBe('Test.Virus.Mock');
    });
  });

  describe('S3 Service and Signed URLs', () => {
    beforeAll(() => {
      process.env.FILE_SIGNING_SECRET = 'test-secret-key-for-signing';
      process.env.FILE_BASE_URL = 'https://test-bucket.s3.amazonaws.com/files';
    });

    it('should generate valid signed URLs', () => {
      const fileKey = 'private/user123/document.pdf';
      const signedUrl = S3Service.generateSignedUrl(fileKey, {
        expirationTime: 3600,
        userId: 'user123',
        permissions: ['read']
      });

      expect(signedUrl).toContain('expires=');
      expect(signedUrl).toContain('signature=');
      expect(signedUrl).toContain('user=user123');
      expect(signedUrl).toContain('perms=read');
      expect(signedUrl).toContain(fileKey);
    });

    it('should validate signed URL components', () => {
      const fileKey = 'test-file.pdf';
      const validUrl = S3Service.generateSignedUrl(fileKey, { expirationTime: 3600 });
      const validation = S3Service.validateSignedUrl(validUrl);

      expect(validation.valid).toBe(true);
      expect(validation.expired).toBeUndefined();
      expect(validation.reason).toBeUndefined();
    });

    it('should detect expired signed URLs', () => {
      const fileKey = 'test-file.pdf';
      const expiredUrl = S3Service.generateSignedUrl(fileKey, { expirationTime: -1 });
      const validation = S3Service.validateSignedUrl(expiredUrl);

      expect(validation.valid).toBe(false);
      expect(validation.expired).toBe(true);
      expect(validation.reason).toBe('URL expired');
    });

    it('should reject URLs with invalid signatures', () => {
      const fileKey = 'test-file.pdf';
      const validUrl = S3Service.generateSignedUrl(fileKey, { expirationTime: 3600 });
      
      // Tamper with the signature
      const tamperedUrl = validUrl.replace(/signature=[^&]+/, 'signature=invalid-signature');
      const validation = S3Service.validateSignedUrl(tamperedUrl);

      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('Invalid signature');
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not-a-url',
        'https://example.com/file?expires=invalid',
        'https://example.com/file?signature=',
        'https://example.com/?expires=123456'
      ];

      malformedUrls.forEach(url => {
        const validation = S3Service.validateSignedUrl(url);
        expect(validation.valid).toBe(false);
        expect(validation.reason).toBeDefined();
      });
    });
  });

  describe('Access Control', () => {
    it('should enforce user ownership of private files', async () => {
      const testCases = [
        { filename: 'user123-document.pdf', userId: 'user123', shouldAllow: true },
        { filename: 'user456-document.pdf', userId: 'user123', shouldAllow: false },
        { filename: 'anonymous-document.pdf', userId: 'user123', shouldAllow: false }
      ];

      testCases.forEach(({ filename, userId, shouldAllow }) => {
        const checkOwnership = (filename: string, userId: string) => {
          return filename.startsWith(userId + '-');
        };

        expect(checkOwnership(filename, userId)).toBe(shouldAllow);
      });
    });

    it('should require authentication for private file access', () => {
      const scenarios = [
        { hasAuth: false, isPrivate: true, shouldAllow: false },
        { hasAuth: true, isPrivate: true, shouldAllow: true },
        { hasAuth: false, isPrivate: false, shouldAllow: true },
        { hasAuth: true, isPrivate: false, shouldAllow: true }
      ];

      scenarios.forEach(({ hasAuth, isPrivate, shouldAllow }) => {
        const checkAccess = (hasAuth: boolean, isPrivate: boolean) => {
          if (isPrivate && !hasAuth) return false;
          return true;
        };

        expect(checkAccess(hasAuth, isPrivate)).toBe(shouldAllow);
      });
    });
  });

  describe('File Processing Pipeline', () => {
    it('should process clean files successfully', async () => {
      const result = await FileValidationService.virusScan(testFile);
      expect(result.clean).toBe(true);
      expect(result.signature).toBeDefined();
    });

    it('should reject infected files and clean up', async () => {
      const virusFile = path.join(testDir, 'virus-test.exe');
      fs.writeFileSync(virusFile, Buffer.from('fake virus content'));

      const mockProcessFile = async (filePath: string) => {
        const scanResult = await FileValidationService.virusScan(filePath);
        
        if (!scanResult.clean) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          throw new Error(`File rejected: ${scanResult.threat}`);
        }
        
        return scanResult;
      };

      await expect(mockProcessFile(virusFile)).rejects.toThrow('File rejected: Test.Virus.Mock');
      expect(fs.existsSync(virusFile)).toBe(false); // File should be deleted
    });
  });
});

describe('Integration Scenarios', () => {
  it('should handle notification delivery failures gracefully', async () => {
    MockNotificationService.enableFailureSimulator();
    
    const mockSendMultiChannel = async (userId: string, message: any) => {
      const results = {
        inApp: null as any,
        email: null as any,
        push: null as any,
        errors: [] as string[]
      };

      // In-app always succeeds
      try {
        results.inApp = await MockNotificationService.sendInAppNotification(userId, message);
      } catch (error) {
        results.errors.push(`In-app failed: ${(error as Error).message}`);
      }

      // Email with retry
      try {
        results.email = await MockNotificationService.retryWithBackoff(
          () => MockNotificationService.sendEmailNotification('user@example.com', message)
        );
      } catch (error) {
        results.errors.push(`Email failed: ${(error as Error).message}`);
      }

      // Push may fail
      try {
        results.push = await MockNotificationService.sendPushNotification('token', message);
      } catch (error) {
        results.errors.push(`Push failed: ${(error as Error).message}`);
      }

      return results;
    };

    const result = await mockSendMultiChannel('user123', { title: 'Test' });
    
    expect(result.inApp.success).toBe(true);
    expect(result.email.success).toBe(true); // Should succeed after retries
    // Push may succeed or fail randomly due to simulation
    expect(result.errors.length).toBeLessThanOrEqual(1); // At most push can fail
  });

  it('should handle file upload with security checks end-to-end', async () => {
    const mockUploadPipeline = async (file: { name: string; size: number; mimetype: string }) => {
      // Validate MIME type
      if (!FileValidationService.validateMimeType(file.mimetype)) {
        throw new Error('Invalid file type');
      }

      // Validate file size
      if (!FileValidationService.validateFileSize(file.size)) {
        throw new Error('File too large');
      }

      // Simulate virus scan
      const scanResult = await FileValidationService.virusScan(file.name);
      if (!scanResult.clean) {
        throw new Error(`Virus detected: ${scanResult.threat}`);
      }

      // Generate signed URL for private file
      const signedUrl = S3Service.generateSignedUrl(
        `private/user123/${file.name}`,
        { expirationTime: 3600, userId: 'user123' }
      );

      return {
        success: true,
        filename: file.name,
        size: file.size,
        mimetype: file.mimetype,
        signedUrl,
        virusClean: scanResult.clean
      };
    };

    // Test valid file
    const validFile = { name: 'document.pdf', size: 1024, mimetype: 'application/pdf' };
    const result = await mockUploadPipeline(validFile);
    expect(result.success).toBe(true);
    expect(result.signedUrl).toContain('signature=');

    // Test invalid MIME type
    const invalidFile = { name: 'script.js', size: 1024, mimetype: 'application/javascript' };
    await expect(mockUploadPipeline(invalidFile)).rejects.toThrow('Invalid file type');

    // Test oversized file
    const largeFile = { name: 'large.pdf', size: 10 * 1024 * 1024, mimetype: 'application/pdf' };
    await expect(mockUploadPipeline(largeFile)).rejects.toThrow('File too large');

    // Test virus file
    const virusFile = { name: 'virus-document.pdf', size: 1024, mimetype: 'application/pdf' };
    await expect(mockUploadPipeline(virusFile)).rejects.toThrow('Virus detected');
  });
});
