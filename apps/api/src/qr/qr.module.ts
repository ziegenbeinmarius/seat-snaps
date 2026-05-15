import { Module } from "@nestjs/common";
import { QrService } from "./qr.service";
import { QrController } from "./qr.controller";
import { QR_SERVICE } from "./domain/IQrService";

@Module({
  controllers: [QrController],
  providers: [
    QrService,
    {
      provide: QR_SERVICE,
      useClass: QrService,
    },
  ],
  exports: [QrService],
})
export class QrModule {}
