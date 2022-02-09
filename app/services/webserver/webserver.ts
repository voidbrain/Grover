/**
 * HTTP Server
 */

import http from 'http';
import url from 'url';
import EventEmitter from  'events' ;

class WebServer extends EventEmitter {
  server: http.Server;
  webServerPort: number;

  constructor(){
    super();
    this.server = http.createServer();
    this.webServerPort = 8081;
  }
  
  start(){
    const self = this;
    self.server.on('request', async (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      const q = url.parse(req.url, true);
      if (q.pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
      }
      const path = q.pathname;
      const queryData = q.query;
      res.write(path);
      res.write(JSON.stringify(queryData));
      res.end();

      // self.emit('remoteCall', path, JSON.stringify(queryData));

      // self.on('callback',(data)=>{
      //   console.log('callback', data);
      //   // res.write('sei nel callback');
      //   // res.end();
      // });
    });
  }
  listen(){
    this.server.listen(this.webServerPort);
    return
  }
}

export default WebServer;
