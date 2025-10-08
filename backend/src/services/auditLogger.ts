/**
 * Audit Logger Service
 * Comprehensive audit logging for all administrative actions
 */

import { logger } from '../utils/logger';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class AuditLoggerService {
  private logs: AuditLogEntry[] = [];

  /**
   * Create a new audit log entry
   */
  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        timestamp: entry.timestamp || new Date()
      };

      // In production, save to database
      this.logs.push(logEntry);

      logger.info('Audit log created:', {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId
      });
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Query audit logs
   */
  async queryAuditLogs(query: AuditLogQuery): Promise<{
    logs: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 50;
      
      // In production, query from database
      let filteredLogs = [...this.logs];

      // Apply filters
      if (query.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
      }

      if (query.action) {
        filteredLogs = filteredLogs.filter(log => log.action === query.action);
      }

      if (query.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === query.resource);
      }

      if (query.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp && log.timestamp >= query.startDate!
        );
      }

      if (query.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp && log.timestamp <= query.endDate!
        );
      }

      // Sort by timestamp descending
      filteredLogs.sort((a, b) => {
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeB - timeA;
      });

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      return {
        logs: paginatedLogs,
        total: filteredLogs.length,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error querying audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    const result = await this.queryAuditLogs({ userId, limit });
    return result.logs;
  }

  /**
   * Get audit logs for a specific resource
   */
  async getResourceAuditLogs(resource: string, resourceId?: string, limit: number = 50): Promise<AuditLogEntry[]> {
    const logs = await this.queryAuditLogs({ resource, limit });
    
    if (resourceId) {
      return logs.logs.filter(log => log.resourceId === resourceId);
    }
    
    return logs.logs;
  }

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    const result = await this.queryAuditLogs({ limit });
    return result.logs;
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCSV(query: AuditLogQuery): Promise<string> {
    try {
      const result = await this.queryAuditLogs({ ...query, limit: 10000 });
      
      // CSV header
      let csv = 'Timestamp,User ID,Action,Resource,Resource ID,Details,IP Address,User Agent\n';
      
      // CSV rows
      result.logs.forEach(log => {
        const row = [
          log.timestamp?.toISOString() || '',
          log.userId,
          log.action,
          log.resource,
          log.resourceId || '',
          `"${log.details.replace(/"/g, '""')}"`,
          log.ipAddress || '',
          `"${(log.userAgent || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });

      return csv;
    } catch (error) {
      logger.error('Error exporting audit logs to CSV:', error);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalLogs: number;
    actionBreakdown: Record<string, number>;
    resourceBreakdown: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    try {
      const result = await this.queryAuditLogs({ 
        startDate, 
        endDate, 
        limit: 100000 
      });

      const logs = result.logs;

      // Action breakdown
      const actionBreakdown: Record<string, number> = {};
      logs.forEach(log => {
        actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      });

      // Resource breakdown
      const resourceBreakdown: Record<string, number> = {};
      logs.forEach(log => {
        resourceBreakdown[log.resource] = (resourceBreakdown[log.resource] || 0) + 1;
      });

      // Top users
      const userCounts: Record<string, number> = {};
      logs.forEach(log => {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      });

      const topUsers = Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalLogs: logs.length,
        actionBreakdown,
        resourceBreakdown,
        topUsers
      };
    } catch (error) {
      logger.error('Error getting audit log statistics:', error);
      throw error;
    }
  }

  /**
   * Clear old audit logs (for maintenance)
   */
  async clearOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // In production, delete from database
      const originalCount = this.logs.length;
      this.logs = this.logs.filter(log => 
        log.timestamp && log.timestamp > cutoffDate
      );

      const deletedCount = originalCount - this.logs.length;
      
      logger.info(`Cleared ${deletedCount} old audit logs`);
      return deletedCount;
    } catch (error) {
      logger.error('Error clearing old audit logs:', error);
      throw error;
    }
  }
}

// Export singleton instance
const auditLoggerService = new AuditLoggerService();

export const createAuditLog = (entry: AuditLogEntry) => 
  auditLoggerService.createAuditLog(entry);

export const queryAuditLogs = (query: AuditLogQuery) => 
  auditLoggerService.queryAuditLogs(query);

export const getUserAuditLogs = (userId: string, limit?: number) => 
  auditLoggerService.getUserAuditLogs(userId, limit);

export const getResourceAuditLogs = (resource: string, resourceId?: string, limit?: number) => 
  auditLoggerService.getResourceAuditLogs(resource, resourceId, limit);

export const getRecentAuditLogs = (limit?: number) => 
  auditLoggerService.getRecentAuditLogs(limit);

export const exportAuditLogsToCSV = (query: AuditLogQuery) => 
  auditLoggerService.exportToCSV(query);

export const getAuditLogStatistics = (startDate?: Date, endDate?: Date) => 
  auditLoggerService.getStatistics(startDate, endDate);

export const clearOldAuditLogs = (daysToKeep?: number) => 
  auditLoggerService.clearOldLogs(daysToKeep);

export default auditLoggerService;
