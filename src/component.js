module.exports = Component;

var fs = require('fs');
var path = require('path');
var Mustache = require('mustache');

function Component(args) {
  
  var APP_PATH = path.normalize('./app');
  var COMPONENT_PATH = path.join(APP_PATH, 'components');

  var relevantArgs = process.argv.slice(2);

  if (!args) {
    throw Error('arguments expected');
  }
  
  if (relevantArgs.length > 1) {
    this.action = relevantArgs[0];
    this.name = relevantArgs[1];
  } else {
    this.action = 'info';
    this.name = relevantArgs[0];
  }
  this.path = path.join(COMPONENT_PATH, this.name);
  this.APP_PATH = APP_PATH;

  this.getInfo();
};
Component.prototype.name = '';
Component.prototype.action = '';
Component.prototype.fileList = {};
Component.prototype.getInfo = function() {

  var self = this;

  fs.readdir(self.path, function(err, filesArray) {
    console.log(filesArray);
    if (err !== null && self.action !== 'create') {
      if (err.code === 'ENOENT') {
        console.log('component `' + self.name + '` not found');
      }
    } else {

      if (!!filesArray) {
        filesArray.forEach(function(item_) {
          self.fileList[item_] = (new ComponentFile(item_));
        });
      }

      if (self.action === 'create') {
        console.log('create');
        if (!!self.fileList[self.name.concat('.js')]) {
          console.log(self.name + ' component already exists');
        } else {
          self.createDir();
        }
      }

      if (self.action === 'info') {
        console.log(self.fileList);
      }
    }

  });
};
Component.prototype.createDir = function(dirpath) {
  var self = this;
  dirpath = dirpath || self.path;

  fs.mkdir(dirpath, function(err) {
    if (err !== null) {
      var fileCount = Object.keys(self.fileList).length;
      if (fileCount > 0) {
        console.log('files exist. aborting');
        return;
      } else if (fileCount === 0) {
        console.log('no files exist. continuing');
      }
    }

    //create module
    self.createModuleFile();

  });
};
Component.prototype.createModuleFile = function(dirpath, name) {
  var self = this;
  dirpath = dirpath || self.path;
  name = name || self.name;

  var modulePath = path.join(dirpath, name.concat('.js'));
  var indexPath = path.join(self.APP_PATH, 'index.html');

  //isolate
  var content = Mustache.render("angular.module('{{name}}', []);", {name: self.name});
  var moduleWriter = fs.createWriteStream(modulePath, {flags: 'wx', encoding: 'utf8'});
  moduleWriter.end(content + '\n');

  //isolate
  var indexReader = fs.createReadStream(indexPath);
  var indexWriter;
  indexReader.on('data', function(chunk) {
    console.log('data');
    var d = (/(<\/script>|-->)(?!.*<script.+><\/script>)([\s\r\n]*)<\/body>/i).exec(chunk.toString());
    if (d !== null) {
      var matchString = d[0];
      var matchMarkup = d[1];

      var actualStart = d.index + matchMarkup.length;
      var scriptTab = '    ';
      var markupTail = chunk.toString().substr(actualStart).replace(/([\r\n]*)(\s*<\/body>)/i, '$2');

      indexWriter = fs.createWriteStream(indexPath, {flags: 'r+', start: actualStart});

      var comment = '<!-- ' + self.name + '-->';
      var script = Mustache.render('<script src="{{src}}"></script>\n', {src: modulePath});
      var outputString = '\n\n' +
        scriptTab + comment + '\n' +
        scriptTab + script + '\n' +
        markupTail;

      indexWriter.write(outputString);
    }

  });
  indexReader.on('end', function() {
    console.log('end');
  });

};
