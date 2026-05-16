export interface AttendeeQrResult {
  buffer: Buffer;
  attendeeName: string;
}

export interface IQrService {
  generateForAttendee(attendeeId: string, eventId: string): Promise<AttendeeQrResult>;
  generateBulkZip(eventId: string): Promise<Buffer>;
  generateEventQr(eventId: string): Promise<Buffer>;
}

export const QR_SERVICE = Symbol("IQrService");
