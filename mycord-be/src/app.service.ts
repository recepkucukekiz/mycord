import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExpressPeerServer } from 'peer';
import * as express from 'express';

@Injectable()
export class AppService implements OnModuleInit {
  private peerServer: any;

  onModuleInit() {
    const app = express();
    const server = app.listen(3002, () => {
      console.log('PeerJS Server çalışıyor: http://localhost:3002');
    });

    this.peerServer = ExpressPeerServer(server);

    app.use('/peerjs', this.peerServer);
  }
  getHello(): string {
    return 'Hello World!';
  }
}
