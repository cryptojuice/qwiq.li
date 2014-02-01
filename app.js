var fs = require('fs');
var mmm = require('mmmagic');
var config = require('./config.json');

var knox = require('knox');

var client = knox.createClient({
  key: config.accessKeyId,
  secret: config.secretAccessKey,
  bucket: config.bucketName
});

var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);


var file = process.argv[2];
var filename = file.toString();
var fileContentType = "";

magic.detectFile(file, function(err, result) {
  if (err) throw err;
  fileContentType = result;
});


fs.stat(file, function(err, stat) {
  var stream = fs.createReadStream(file);
  var header = {
    'Content-Type': fileContentType,
    'Content-Length': stat.size,
    'x-amz-acl': 'public-read'
  };

  client.putStream(stream, filename, header, function(err, res) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(res.req.url);
    process.stdout.write('\n');
  }).on('progress', function(event) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('uploading... '+event.percent+'%');
  });

});
