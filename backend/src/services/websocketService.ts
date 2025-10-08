/**
 * WebSocket Service
 * Real-time updates for dashboards and notifications
 */

import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  /**
   * Initialize WebSocket server
   */
  initialize(io: Server) {
    this.io = io;

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        next(new Error('Authentication error'));
      }
    });

    // Connection handling
    io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const userRole = socket.userRole!;

      logger.info(`WebSocket connected: User ${userId} (${userRole}), Socket ${socket.id}`);

      // Track connected user
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);
      socket.join(`role:${userRole}`);

      // Handle room joins
      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.info(`User ${userId} joined project room: ${projectId}`);
      });

      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        logger.info(`User ${userId} left project room: ${projectId}`);
      });

      // Handle dashboard subscriptions
      socket.on('subscribe-dashboard', (dashboardType: string) => {
        socket.join(`dashboard:${dashboardType}`);
        logger.info(`User ${userId} subscribed to dashboard: ${dashboardType}`);
      });

      socket.on('unsubscribe-dashboard', (dashboardType: string) => {
        socket.leave(`dashboard:${dashboardType}`);
        logger.info(`User ${userId} unsubscribed from dashboard: ${dashboardType}`);
      });

      // Handle AI processing subscriptions
      socket.on('subscribe-ai-job', (jobId: string) => {
        socket.join(`ai-job:${jobId}`);
        logger.info(`User ${userId} subscribed to AI job: ${jobId}`);
      });

      // Handle marketplace subscriptions
      socket.on('subscribe-marketplace', () => {
        socket.join('marketplace');
        logger.info(`User ${userId} subscribed to marketplace`);
      });

      // Disconnection
      socket.on('disconnect', () => {
        logger.info(`WebSocket disconnected: Socket ${socket.id}`);
        
        // Remove from connected users
        const sockets = this.connectedUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
      });
    });

    logger.info('WebSocket service initialized');
  }

  /**
   * Emit to specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Emitted ${event} to user ${userId}`);
  }

  /**
   * Emit to all users with specific role
   */
  emitToRole(role: string, event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to(`role:${role}`).emit(event, data);
    logger.debug(`Emitted ${event} to role ${role}`);
  }

  /**
   * Emit to project room
   */
  emitToProject(projectId: string, event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to(`project:${projectId}`).emit(event, data);
    logger.debug(`Emitted ${event} to project ${projectId}`);
  }

  /**
   * Emit to dashboard subscribers
   */
  emitToDashboard(dashboardType: string, event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to(`dashboard:${dashboardType}`).emit(event, data);
    logger.debug(`Emitted ${event} to dashboard ${dashboardType}`);
  }

  /**
   * Emit to AI job subscribers
   */
  emitToAIJob(jobId: string, event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to(`ai-job:${jobId}`).emit(event, data);
    logger.debug(`Emitted ${event} to AI job ${jobId}`);
  }

  /**
   * Emit to marketplace
   */
  emitToMarketplace(event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.to('marketplace').emit(event, data);
    logger.debug(`Emitted ${event} to marketplace`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    if (!this.io) {
      logger.error('WebSocket not initialized');
      return;
    }

    this.io.emit(event, data);
    logger.debug(`Broadcasted ${event} to all clients`);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get user's socket count
   */
  getUserSocketCount(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  // ========== Event Emitters ==========

  /**
   * Project status updated
   */
  projectStatusUpdated(projectId: string, status: string, data: any) {
    this.emitToProject(projectId, 'project:status-updated', {
      projectId,
      status,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Verification status updated
   */
  verificationStatusUpdated(projectId: string, userId: string, status: string, data: any) {
    this.emitToUser(userId, 'verification:status-updated', {
      projectId,
      status,
      ...data,
      timestamp: new Date()
    });
    
    this.emitToProject(projectId, 'verification:status-updated', {
      projectId,
      status,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Upload processing completed
   */
  uploadProcessingCompleted(userId: string, uploadId: string, results: any) {
    this.emitToUser(userId, 'upload:processing-completed', {
      uploadId,
      results,
      timestamp: new Date()
    });
  }

  /**
   * AI job status updated
   */
  aiJobStatusUpdated(jobId: string, userId: string, status: string, progress?: number, results?: any) {
    const data = {
      jobId,
      status,
      progress,
      results,
      timestamp: new Date()
    };

    this.emitToUser(userId, 'ai:job-status-updated', data);
    this.emitToAIJob(jobId, 'job-status-updated', data);
  }

  /**
   * Carbon calculation completed
   */
  carbonCalculationCompleted(projectId: string, userId: string, results: any) {
    this.emitToUser(userId, 'carbon:calculation-completed', {
      projectId,
      results,
      timestamp: new Date()
    });

    this.emitToProject(projectId, 'carbon:calculation-completed', {
      projectId,
      results,
      timestamp: new Date()
    });
  }

  /**
   * Credits minted
   */
  creditsMinted(projectId: string, userId: string, data: any) {
    this.emitToUser(userId, 'credits:minted', {
      projectId,
      ...data,
      timestamp: new Date()
    });

    this.emitToProject(projectId, 'credits:minted', {
      projectId,
      ...data,
      timestamp: new Date()
    });

    // Notify marketplace
    this.emitToMarketplace('credits:new-listing', {
      projectId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Credit purchased
   */
  creditPurchased(creditId: string, buyerId: string, sellerId: string, data: any) {
    this.emitToUser(buyerId, 'credits:purchased', {
      creditId,
      role: 'buyer',
      ...data,
      timestamp: new Date()
    });

    this.emitToUser(sellerId, 'credits:sold', {
      creditId,
      role: 'seller',
      ...data,
      timestamp: new Date()
    });

    this.emitToMarketplace('credits:trade-completed', {
      creditId,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Dashboard data updated
   */
  dashboardDataUpdated(dashboardType: 'landowner' | 'buyer' | 'admin', data: any) {
    this.emitToDashboard(dashboardType, 'dashboard:data-updated', {
      dashboardType,
      data,
      timestamp: new Date()
    });
  }

  /**
   * New notification
   */
  newNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification:new', {
      notification,
      timestamp: new Date()
    });
  }

  /**
   * Blockchain transaction confirmed
   */
  blockchainTransactionConfirmed(userId: string, txHash: string, data: any) {
    this.emitToUser(userId, 'blockchain:transaction-confirmed', {
      txHash,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * Admin alert (urgent notifications)
   */
  adminAlert(alertType: string, data: any) {
    this.emitToRole('admin', 'admin:alert', {
      alertType,
      ...data,
      timestamp: new Date()
    });
  }

  /**
   * System announcement
   */
  systemAnnouncement(message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    this.broadcast('system:announcement', {
      message,
      priority,
      timestamp: new Date()
    });
  }
}

export default new WebSocketService();
