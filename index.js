const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
// var http = require('http');

String.prototype.regexIndexOf = function(regex) {
  var startpos = 0;
  var indexOf = this.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

Array.prototype.findMatches = function(matches) {
  indexOf = this.some(function(it) {
    return it === matches;
  });
  return indexOf;
}
 
async function main() {
 
  const chrome = await chromeLauncher.launch({
 
    chromeFlags: [
 
      '--window-size=1200,800',
      '--user-data-dir=/tmp/chrome-testing',
      '--auto-open-devtools-for-tabs',
      '--allow-files-access-from-files',
      '--disable-web-security',
       '--allow-insecure-localhost'
    ],
    startingUrl: 'http://localhost:4502/content/digitalexp/sprint/landing-page.html'
 
  });

  // var options = {
  //   host: 'localhost',
  //   port: 9922,
  //   path: '/json',
  //   method: 'POST'
  // }

  // const req = http.request(options, function (res) {
  //   console.log(res.header);
  //   res.on('data', function(chunk) {
  //     console.log(chunk);
  //   })
  // })

  // req.on('error', function (e) {console.log('propblem') + e.message});
  // req.write(JSON.stringify({
  //   'id':1,
  //   'method': "page.anable"
  // }));
  // req.end();

  // // test WebSocket connect 
  // console.log(JSON.stringify(chrome));
  // const url = 'http://localhost:9222/json';

  // const targetData = fetch(url)
  //     .then(data => {
  //         console.log('GOOD',data.json());
  //     }).catch(error => {
  //       console.log('BAD', error);
  //     })
  //     targetData();
    const protocol = await CDP({ port: chrome.port });
    const { Runtime, Network } = protocol;
    await Promise.all([Runtime.enable(), Network.enable()]);
 
    // Runtime.consoleAPICalled(({ args, type }) =>{
    //     console.log('Console Type ---------------------', args);
    //     if (console[type]) {
    //         console[type].apply(console, args.map(a => a.value))    
    //     }
    // }
    // );

    await Network.setRequestInterception(
        { patterns: [
          {
            urlPattern: '*localhost:4502/apigw*',
            resourceType: 'XHR',
            interceptionStage: 'Request'
          }
        ]}
      );

       Network.requestIntercepted(async ({ interceptionId, request}) => {
         const methodScope = ['POST', 'GET', 'DELETE', 'PATCH'];

         if (request.method)
        console.log(`Intercepted ${request.url} {interception id: ${interceptionId}}`)
        Network.continueInterceptedRequest({interceptionId});
      });

      // Initiator
      // var count = 0;
      // Network.requestWillBeSent(async ({RequestId, request,  initiator}) => {        
      //   if (request.url.indexOf(':8080') > 0 && count < 1) {
      //     count++;
      //     debugger;
      //     console.log(initiator.stack);
      //     if (Object.keys(initiator).length > 0) {
      //       console['log'].apply(console, JSON.stringify(Object.keys(initiator)['stack']));
      //     }
      //   }
      //   console['log'].apply(console, initiator.map((v)=> v.value));
      //   console.log(`Intercepted ${request.url} {interception id: ${initiator}}`);
      // });

  }
main()