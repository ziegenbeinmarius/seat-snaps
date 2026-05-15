export interface IQrService {
  generateForAttendee(attendeeId: string, eventId: string, userId: string): Promise<Buffer>;
  generateBulkZip(eventId: string, userId: string): Promise<Buffer>;
  generateEventQr(eventId: string, userId: string): Promise<Buffer>;
}

export const QR_SERVICE = Symbol("IQrService");
