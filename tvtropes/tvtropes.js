var cheerio = require('cheerio'),
    request = require('request');
    Q = require('q'),
    _  = require('lodash'),
    fs = require('fs');

var ROOT_PAGE = "http://tvtropes.org/pmwiki/pmwiki.php/Main/NarrativeDevices"; 
//"http://tvtropes.org/pmwiki/pmwiki.php/Main/NarrativeTropes";

var queue = [ROOT_PAGE];
var scanned = {};
var examplesMap = {};
function next() {
  if (queue.length <= 0) {
    fs.writeFileSync("./tropes.json", JSON.stringify(examplesMap, null, 2));
  } else {
    var url = queue.shift();
    var pageScanQ = scanPage(url);

    pageScanQ.then(function(result) {
      // if (result.indexes) {
      //   addAllToQueue(result.indexes);
      // }

      if (result.tropes) {
        addAllToQueue(result.tropes);
      }

      if (result.examples) {
        examplesMap[url] = result.examples;
      }
    }).then(function() {
      next();
    }).catch(function(err) {
      console.error(err.stack);
    });
  }
}
next();

function addAllToQueue(pages) {
  _.each(pages, function(url) {
    if (!scanned[url]) {
      queue.push(url);  
    }
  });
}

function scanPage(url) {
  // Don't scan the same page twice
  if (scanned[url]) return Q.fcall(function() {return {}});
  scanned[url] = true;
  console.log("Scanning page " + url + "...");

  return loadPage(url).then(function(html) {
    var $ = cheerio.load(html);

    var result = {};

    var indexes = $('#wikitext ul li.plus a.twikilink');
    indexes = indexes.map(function() {
        return $(this).attr('href');
    });

    if (indexes.length) {
      result.indexes = indexes;
    }

    var tropes = [];
    var tropesHeaders = $('#wikitext h2').filter(function() {
      var text = $(this).text();
      if (text.match(/tropes/i)) {
        return true;
      }
    });

    tropesHeaders.each(function() {
      var $this = $(this);
      $this.next('ul').find('a.twikilink').each(function() {
        var link = $(this).attr('href');
        tropes.push(link);
      });
    });

    if (tropes.length) {
      result.tropes = tropes;
    }

    var examplesHeaders = $('#wikitext h2').filter(function() {
      var text = $(this).text();
      if (text.match(/examples/i)) {
        return true;
      }
    });
    var inlineExamples = examplesHeaders.nextAll().find('li').length;

    if (inlineExamples) {
      // console.log("DEBUG: Has " + inlineExamples + " inline examples");
      result.inlineExamples = inlineExamples;
    }

    var exampleSubpagesHeader = $('#wikitext h2').filter(function() {
      var text = $(this).text();
      if (text.match(/^example subpages/i)) {
        return true;
      }
    }).first();
    var exampleSubpages = exampleSubpagesHeader.nextUntil('h2').find('li a.twikilink').map(function() {
      return $(this).attr('href');
    });

    if (exampleSubpages.length) {
      result.exampleSubpages = exampleSubpages;
    }

    return result;
  }).then(function(result) {
    if (result.inlineExamples) {
      result.examples = result.inlineExamples;
    } else {
      result.examples = 0;
    }

    if (result.exampleSubpages) {
      return Q.all(_.map(result.exampleSubpages, function(url) {
        return scanExamplesSubpage(url)
      })).then(function(exampleSubpageCounts) {
        return _.reduce(exampleSubpageCounts, function(sum, num) {
          return sum + num;
        });
      }).then(function(externalExamples) {
        result.examples += externalExamples;
        return result;
      });
    }

    return result;
  });
}

function scanExamplesSubpage(url) {
  return loadPage(url).then(function(html) {
    var $ = cheerio.load(html);

    var count = $('#wikitext li').length;

    return count;
  });
}

function loadPage(url) {
  var deferred = Q.defer();
  request.get(url, function(err, req, body) {
    if (err) return deferred.reject(err);
    if (req.statusCode >= 200 && req.statusCode < 300) {
      deferred.resolve(body);
    } else {
      deferred.reject(body);
    }
  });
  return deferred.promise;
}