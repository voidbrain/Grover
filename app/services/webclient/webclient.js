/**
 * HTTP Webclient
 */

import https from 'https';

class WebClient {
  remoteServer

  constructor(){
    this.remoteServer = 'https://www.voidbrain.net/grover/ajax/moduli/api/';
  }
  
  async callRemote(page, action=null){
    const self = this;
    https.get(self.remoteServer+page + '?action=' + action, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log('[WEBCLIENT] ==> ', data)
        // console.log(JSON.parse(data));
        return (data);
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
  
}

export default WebClient;
