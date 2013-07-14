#!/usr/bin/env node
   /*
     Automatically grade files for the presence of specified HTML tags/attributes.
     Uses commander.js and cheerio. Teaches command line application development
     and basic DOM parsing.

     References:

      + cheerio
         - https://github.com/MatthewMueller/cheerio
         - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
         - http://maxogden.com/scraping-with-node.html

      + commander.js
         - https://github.com/visionmedia/commander.js
         - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

      + JSON
         - http://en.wikipedia.org/wiki/JSON
         - https://developer.mozilla.org/en-US/docs/JSON
         - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
   */

var util = require('util');
var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var tmpfile = "url.tmp";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function checkfile(inputfile, checks) {
        var checkJson = checkHtmlFile(inputfile, checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
};

var buildfn = function(outfile, checks) {
    var responsefn = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            console.error("Wrote %s", outfile);
            fs.writeFileSync(outfile, result);
            checkfile(outfile, checks);
        }
    };
    return responsefn;
};



if(require.main == module) {
        program
            .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
            .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
            .option('-u, --url <url>', 'Path to Heroku file')
            .parse(process.argv);

        if (program.url) {
            var response2file = buildfn(tmpfile, program.checks);
            rest.get(program.url).on('complete', response2file);
        }
        else {
            checkfile(program.file, program.checks);
        }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}