import { pool } from '../config/database';

export interface NotificationData {
  title: string;
  message: string;
  type: 'bill' | 'complaint' | 'announcement' | 'system';
  urgent?: boolean;
  data?: any;
}

export interface NotificationChannels {
  inApp?: boolean;
  email?: boolean;
  push?: boolean;
}

class NotificationService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

  /**
   * Send notification through multiple channels
   */
  static async sendNotification(
    userId: string,
    buildingId: string,
    notification: NotificationData,
    channels: NotificationChannels = { inApp: true }
  ) {
    const results = {
      inApp: null as any,
      email: null as any,
      push: null as any,
      errors: [] as string[]
    };

    // Always create in-app notification as record
    if (channels.inApp !== false) {
      try {
        results.inApp = await this.createInAppNotification(userId, buildingId, notification);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`In-app notification failed: ${errorMessage}`);
      }
    }

    // Get user details for email/push
    const userQuery = 'SELECT email, push_token FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];

    if (channels.email && user?.email) {
      try {
        results.email = await this.retryWithBackoff(
          () => this.sendEmailNotification(user.email, notification),
          this.MAX_RETRIES
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Email notification failed: ${errorMessage}`);
      }
    }

    if (channels.push && user?.push_token) {
      try {
        results.push = await this.retryWithBackoff(
          () => this.sendPushNotification(user.push_token, notification),
          this.MAX_RETRIES
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Push notification failed: ${errorMessage}`);
      }
    }

    return results;
  }

  /**
   * Create in-app notification record
   */
  static async createInAppNotification(
    userId: string,
    buildingId: string,
    notification: NotificationData
  ) {
    const query = `
      INSERT INTO notifications (user_id, building_id, type, title, message, urgent, read, data, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, $7, NOW())
      RETURNING *
    `;

    const values = [
      userId,
      buildingId,
      notification.type,
      notification.title,
      notification.message,
      notification.urgent || false,
      notification.data ? JSON.stringify(notification.data) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Send email notification with retry logic
   */
  static async sendEmailNotification(email: string, notification: NotificationData) {
    // Mock email service - replace with actual email provider
    console.log(`Sending email to ${email}: ${notification.title}`);
    
    // Simulate potential failures
    if (Math.random() < 0.3) {
      throw new Error('Email service temporarily unavailable');
    }

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      channel: 'email',
      recipient: email,
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(pushToken: string, notification: NotificationData) {
    // Mock push service - replace with FCM/APNS
    console.log(`Sending push to ${pushToken}: ${notification.title}`);
    
    // Simulate potential failures
    if (Math.random() < 0.2) {
      throw new Error('Push service unavailable');
    }

    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      success: true,
      channel: 'push',
      recipient: pushToken,
      messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Retry mechanism with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Attempt ${attempt + 1} failed: ${errorMessage}`);

        // Don't wait after the last attempt
        if (attempt < maxRetries - 1) {
          const delay = this.RETRY_DELAYS[attempt] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Get unread notification count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId: string) {
    const query = `
      UPDATE notifications 
      SET read = true 
      WHERE user_id = $1 AND read = false
      RETURNING COUNT(*) as updated_count
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * Broadcast notification to all users in building
   */
  static async broadcastToBuilding(
    buildingId: string,
    notification: NotificationData,
    channels: NotificationChannels = { inApp: true }
  ) {
    const usersQuery = "SELECT id FROM users WHERE building_id = $1 AND status = 'approved'";
    const usersResult = await pool.query(usersQuery, [buildingId]);
    
    const results = [];
    for (const user of usersResult.rows) {
      try {
        const result = await this.sendNotification(user.id, buildingId, notification, channels);
        results.push({ userId: user.id, ...result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ 
          userId: user.id, 
          error: errorMessage,
          inApp: null,
          email: null,
          push: null,
          errors: [errorMessage]
        });
      }
    }
    
    return {
      totalUsers: usersResult.rows.length,
      results
    };
  }
}

export default NotificationService;
