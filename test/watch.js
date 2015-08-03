"use strict";

var assert = require("assert")
  , should = require("should")
  , Vantage = require("vantage")
  , path = require("path")
  , watch = require("./../lib/watch")
  , fs = require("fs")
  ;

var vantage
  , stdout = ""
  , placeholder
  , files
  ;

placeholder = 
  "module.exports = function(vantage) {" + 
  " {{replaceme}} " + 
  "};"; 

files = [
  'vantage.command("foo", "").action(function(args, cb){ this.log("foo"); cb(' + Math.random() + '); })',
  'vantage.command("foo", "").action(function(args, cb){ this.log("foo1"); cb(' + Math.random() + '); })',
  'vantage.command("foo", "").action(function(args, cb){ this.log("foo2"); cb(' + Math.random() + '); })',
  'vantage.command("foo", "").action(function(args, cb){ this.log("foo3"); cb(' + Math.random() + '); }); ' + 
  'vantage.command("bar", "").action(function(args, cb){ this.log("bar"); cb(' + Math.random() + '); })'
];

files = files.map(function(string) {
  return placeholder.replace("{{replaceme}}", string);
});

function stdoutFn(data) {
  stdout += data;
  return "";
}

function write(text, cb) {
  fs.writeFile(path.join(__dirname, "./commands.js"), text, function(err, data) {
    setTimeout(function() {
      stdout = "";
      cb(err, data);
    }, 250);
  });
}

describe("vantage-watch", function() {

  before("preps", function(done) {
    this.timeout(5000);
    write(" {} ", function(err, data) {
      vantage = new Vantage().pipe(stdoutFn).show();
      vantage
        .use(watch, {
          files: ["./commands.js"]
        });
      done();
    });
  });

  beforeEach("vantage preps", function() {
    stdout = "";
  });

  it("should load a new file", function(done) {
    this.timeout(5000);
    write(files[0], function(err, data) {
      should.not.exist(err);
      vantage.exec("foo", function(err2, data2){
        should.not.exist(err);
        stdout.should.eql("foo");
        done();
      });
    });
  });

  it("should load a second file and change a command", function(done) {
    this.timeout(5000);
    write(files[1], function(err, data) {
      should.not.exist(err);
      vantage.exec("foo", function(err2, data2){
        should.not.exist(err);
        stdout.should.eql("foo1");
        done();
      });
    });
  });

  it("should load a third file and change a command", function(done) {
    this.timeout(5000);
    write(files[2], function(err, data) {
      should.not.exist(err);
      vantage.exec("foo", function(err2, data2){
        should.not.exist(err);
        stdout.should.eql("foo2");
        done();
      });
    });
  });
});
