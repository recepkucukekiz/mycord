import { Module } from '@nestjs/common';
import { RTCGateway } from './rtc.gateway';
import { RTCService } from './rtc.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RTCService, RTCGateway],
})
export class RTCModule {}
