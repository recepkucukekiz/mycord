import { Module } from '@nestjs/common';
import { RTCGateway } from './rtc.gateway';
import { WebRtcGateway } from './webrtc.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [RTCGateway, WebRtcGateway],
})
export class RTCModule {}
