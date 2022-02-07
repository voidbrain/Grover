/**
 * HTTP Server
 */

const http = require('http');
const https = require('https');
const url = require('url');
const EventEmitter = require( 'events' );

class WebServer extends EventEmitter {
  constructor(){
    super();
    this.webserver = http.createServer();
    this.remoteServer = 'https://www.voidbrain.net/grover/ajax/moduli/api/';
  }
  callRemote(page, message){
    const promise = new Promise((resolve, reject) => {
      const self = this;
      // console.log(self.remoteServer+page + '?message=' + message)
      https.get(self.remoteServer+page + '?message=' + message, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          console.log(JSON.parse(data));
          resolve(JSON.parse(data));
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject(JSON.parse(err));
      });
    });
    return promise;
  }
  startServer(){
    const self = this;
    self.webserver.on('request', async (req, res) => {
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

      self.emit('remoteCall', path, JSON.stringify(queryData));

      self.on('callback',(data)=>{
        console.log('callback', data);
        // res.write('sei nel callback');
        // res.end();
      });
    });
  }
  listen(){
    this.webserver.listen(8080);
    return
  }
}

export default WebServer;
