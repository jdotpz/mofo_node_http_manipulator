var http = require('http');
var request = require('request');

// module.exports is a middleware
module.exports = function (appOptions, port) {
  return http.createServer(function (req, res) {
    var requestHost = req.headers.host.split(':')[0];
    var hostOptions = appOptions[requestHost];
    var actionOptions = hostOptions.function;

    if(!hostOptions){
      console.log(req.host + ' is not a valid host');
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end(req.host + ' is invalid');
    }

    if(actionOptions === "redirect"){
      var url = hostOptions.host + req.url;

      console.log('Redirecting ' + req.host + ' to ' + hostOptions.host + ' with a http status code of ' + hostOptions.code);

      // Set the status and redirect
      res.statusCode = hostOptions.code || 302;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Location', url);
      res.end('Redirecting to '+url);
    }

    if(actionOptions === "proxy") {
      var url = hostOptions.host + req.url;
      request.get(url, function(error, result) {
        if (error) {
          res.write("there was an error requesting " + req.protocol + '://' + hostOptions.host);
          res.write( JSON.stringify(error) );
          return console.error(error);
        }
      console.log('Pulling ' + url + ' to ' + requestHost);
      res.write( result.body );
      res.end();
      });
    }

  }).listen(port);
}