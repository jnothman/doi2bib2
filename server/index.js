 'use strict';

var http = require('http'),
    express = require('express'),
    cors = require('cors'),
    app = express(),
    env = process.env.NODE_ENV || 'development',

    doi2bib = require('./doi2bib');

if ('production' === env) {
  app.use(express.static(__dirname + '/../client/build'));
} else {
  app.use(cors());
}

var
genErrorHandler = function(res) {
  return function(errorCode) {
    if (http.STATUS_CODES[errorCode]) {
      res.writeHead(errorCode);
      res.end(http.STATUS_CODES[errorCode]);
    } else {
      res.writeHead(500);
      res.end(http.STATUS_CODES[500]);
    }
  };
},
genSuccessHandler = function(res) {
  return function(bib) {
    res.end(bib);
  };
};

app.get('/doi2bib', function(req, res) {
  res.set('Content-Type', 'application/x-bibtex');

  if (!/^10\..+\/.+$/.test(req.query.id)) {
    res.writeHead(400);
    res.end('Invalid DOI');
  } else {
    doi2bib.doi2bib(req.query.id).then(genSuccessHandler(res), genErrorHandler(res));
  }
});

app.get('/pmid2bib', function(req, res) {
  res.set('Content-Type', 'application/x-bibtex');


  if (!/^\d+$|^PMC\d+(\.\d+)?$/.test(req.query.id)) {
    res.writeHead(400);
    res.end('Invalid PMID');
  } else {
    doi2bib.pmid2doi(req.query.id).
      then(function(doi) {
        return doi2bib.doi2bib(doi);
      }).
      then(genSuccessHandler(res), genErrorHandler(res));
  }
});

app.get('/arxivid2bib', function(req, res) {
  res.set('Content-Type', 'application/x-bibtex');
  if (!/^\d+\.\d+(v(\d+))?$/.test(req.query.id)) {
    res.writeHead(400);
    res.end('Invalid arXiv ID');
  } else {
    doi2bib.arxivid2doi(req.query.id).
      then(function(doi) {
        return doi2bib.doi2bib(doi);
      }).
      then(genSuccessHandler(res), genErrorHandler(res));
  }
});

app.listen(
  3001,
  '127.0.0.1',
  function() {
    console.log('node server started');
  }
);
