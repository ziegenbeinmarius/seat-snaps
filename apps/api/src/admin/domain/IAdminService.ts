import type {
  AdminUserResponse,
  AdminEventResponse,
  AdminMetricsResponse,
} from "@seat-snaps/shared";

export interface IAdminService {
  getUsers(): Promise<AdminUserResponse[]>;
  getEvents(): Promise<AdminEventResponse[]>;
  getMetrics(): Promise<AdminMetricsResponse>;
  forceDeleteUser(id: string): Promise<void>;
  forceDeleteEvent(id: string): Promise<void>;
}

export const ADMIN_SERVICE = Symbol("IAdminService");
