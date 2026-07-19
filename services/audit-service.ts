import { AuditEvent } from '../types/audit';

class AuditService {
  private events: AuditEvent[] = [];

  async logEvent(event: AuditEvent): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.events.push(event);
  }

  async getEvents(filters?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
  }): Promise<AuditEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let filtered = this.events;

    if (filters?.entityType) {
      filtered = filtered.filter(e => e.entityType === filters.entityType);
    }

    if (filters?.entityId) {
      filtered = filtered.filter(e => e.entityId === filters.entityId);
    }

    if (filters?.userId) {
      filtered = filtered.filter(e => e.userId === filters.userId);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditService = new AuditService();
