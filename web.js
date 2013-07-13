var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var inbuf = fs.readFileSync("index.html");
  response.send(inbuf.toString());
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});