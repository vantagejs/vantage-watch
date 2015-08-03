
"use strict";

/**
 * Module dependencies.
 */

var _ = require("lodash")
  , chalk = require("chalk")
  , path = require("path")
  , watch = require("node-watch")
  , decache = require("decache")
  , callsite = require("callsite")
  ;

module.exports = function(vantage, options) {
  var self = this;
  var vtg = vantage;
  var stack = callsite();

  var callingFile = String(stack[2].getFileName()).split("/");
  callingFile.pop();
  callingFile = path.normalize(callingFile.join("/") + "/");

  options = options || {}
  options.root = options.root || callingFile;
  options.files = options.files || [];
  options.files = (_.isString(options.files)) ? [options.files] : options.files;

  if (!_.isArray(options.files)) {
    throw new Error("An invalid `files` value was passed into vantage-watch.");
  }

  var files = options.files.map(function(file) {
    return chalk.cyan(file);
  }).join(", ");

  options.files = options.files.map(function(end){
    return options.root + end;
  });

  self.log("Watching " + files + " for changes.");
  watch(options.files, function(filename){

    var mod;
    var ctr = [];

    function registryCounter(cmd) {
      ctr.push(cmd.name);
    }

    self.log("Change in " + chalk.cyan(filename) + ". Reloading:");

    try {
      decache(filename);
      mod = require(filename);
    } catch(e) {
      self.log(chalk.yellow("Error requiring Vantage extension: "), e);
      return;
    } 

    if (!_.isObject(mod) && _.isArray(mod)) {
      self.log(chalk.yellow("Error importing Vantage extension: ") + " file does not appear to be a Vantage extension.");
      return;
    }

    vtg.on("command_registered", registryCounter);

    try {
      vtg.use(mod);
    } catch(e) {
      self.log(chalk.yellow("Error importing Vantage extension: "), e);
      return;
    }

    var ctr = ctr.map(function(command) {
      return chalk.cyan(command);
    }).join(", ");

    if (ctr.length > 0) {
      self.log("Registered the following commands: " + ctr + ".");
    } else {
      self.log("Success. No commands registred.");
    }
    vtg.removeListener("command_registered", registryCounter);

  });  
  
};
