export interface AttendeeQrResult {
  buffer: Buffer;
  attendeeName: string;
}

export interface IQrService {
  generateForAttendee(attendeeId: string, eventId: string, userId: string, appUrl?: string): Promise<AttendeeQrResult>;
  generateBulkZip(eventId: string, userId: string, appUrl?: string): Promise<Buffer>;
  generateEventQr(eventId: string, userId: string, appUrl?: string): Promise<Buffer>;
}

export const QR_SERVICE = Symbol("IQrService");
