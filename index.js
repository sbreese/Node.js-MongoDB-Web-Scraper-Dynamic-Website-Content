var express = require('express');
var http = require('http');
var path = require('path'); // used in File Uploader & DB
const reqPromise = require('request-promise'); // used in Screen Scraping
const cheerio = require('cheerio'); // used in Screen Scraping
const bodyParser = require('body-parser'); // used in Screen Scraping & DB

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public'))); // Use express.static middleware to serve up the static files in our public/ directory

app.use(bodyParser.json()); // for screen scraper

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/Node-js-Web-Scraping', function(request, response) {
    response.render('pages/Node-js-Web-Scraping');
});

var mongoose = require('mongoose');
var Content = mongoose.model('ScrapedContent');
app.get('/Dynamic-Website-Content-with-MongoDB', function(request, response) {

    //var pageContent = ctrlScrapedContent.scrapedContentFindByName("Node Topics");
    Content
        .findOne({
            name: "Node Topics"
        })
        .exec(function(err, scrapedContent) {

            if (!scrapedContent) {
                response.render('pages/NodeJS-Topics', {
                    pageContent: 'scrapedContent by name not found'
                });
            } else if (err) {
                console.log(err);
                response.render('pages/NodeJS-Topics', {
                    pageContent: 'There was an error: ' + err
                });
            }
            console.log("Controller scrapedContentFindByName success!", scrapedContent);

            //return scrapedContent;
            response.render('pages/Dynamic-Website-Content-with-MongoDB', {
                pageContent: scrapedContent
            });
        });

});

var module_topics = {
    'assert': 'Assertion Tests',
    'buffer': 'Binary Data',
    'cluster': 'Child Processes',
    'crypto': 'OpenSSL',
    'dgram': 'UDP Datagram Sockets',
    'dns': 'DNS Lookups',
    'events': 'Events',
    'fs': 'File System',
    'http': 'HTTP Server',
    'https': 'HTTPS Server',
    'net': 'Client & Server',
    'os': 'Operating System',
    'path': 'File Paths',
    'querystring': 'URL Query Strings',
    'readline': 'File Stream',
    'stream': 'Readable/Writable Streams',
    'string_decoder': 'Decode Binary Data',
    'timers': 'Timers',
    'tls': 'SSL',
    'url': 'URL Strings',
    'util': 'String Formatting',
    'vm': 'Virtual Machine',
    'zlib': 'File Compression'
};
var mongodb_methods = {
    'nodejs_mongodb.asp': {
        method: "require('mongodb').MongoClient",
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html"
    },
    'nodejs_mongodb_create_db.asp': {
        method: 'connect()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html#.connect"
    },
    'nodejs_mongodb_createcollection.asp': {
        method: 'createCollection()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html#createCollection"
    },
    'nodejs_mongodb_insert.asp': {
        method: 'insertOne()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#insertOne"
    },
    'nodejs_mongodb_find.asp': {
        method: 'findOne()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#findOne"
    },
    'nodejs_mongodb_query.asp': {
        method: 'find()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#find"
    },
    'nodejs_mongodb_sort.asp': {
        method: 'sort()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Cursor.html#sort"
    },
    'nodejs_mongodb_delete.asp': {
        method: 'deleteOne()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#deleteOne"
    },
    'nodejs_mongodb_drop.asp': {
        method: 'drop()',
        reference: "http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html#drop"
    },
    'nodejs_mongodb_update.asp': {
        method: 'updateOne()',
        reference: "http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#updateOne"
    },
    'nodejs_mongodb_limit.asp': {
        method: 'limit()',
        reference: "https://mongodb.github.io/node-mongodb-native/api-generated/cursor.html#limit"
    },
    'nodejs_mongodb_join.asp': {
        method: 'aggregate([{ $lookup: }])',
        reference: "https://mongodb.github.io/node-mongodb-native/api-generated/collection.html?#aggregate"
    },
};

function nameNotInArray(arr, name) {
    var id = arr.length + 1;
    var found = arr.some(function(el) {
        return el.name === name;
    });
    return !found;
}

var ScrapeCount = 0;
app.post('/scrapeNodeTopics', function(req, res) {

    if (req.body.site_to_scrape) {
        var options = {
            url: 'https://www.w3schools.com/nodejs/default.asp',
            transform: body => cheerio.load(body)
        };
        var nodeTopicsTable = [];

        reqPromise(options)
            .then(function($) {
                const w3NodeTopicsExist = $('#leftmenuinnerinner a').length != 0;
                const w3NodeTopics = w3NodeTopicsExist ? $('#leftmenuinnerinner a') : 'page not found';

                var countOfNodeTopics = $(w3NodeTopics).length;
                // loop through all the links, pull out the text and href
                $(w3NodeTopics).each(function(i, elem) {
                    if ($(this).text() != 'x' && $(this).text() != 'Node.js HOME' && $(this).text() != 'Node.js Intro' && $(this).text() != 'Node.js Get Started') {

                        var topicLabel = $(this).text();
                        var w3schoolsPage = $(this).attr('href');

                        if (topicLabel.includes("MySQL") || topicLabel.includes("MongoDB")) {
                            nodeTopicsTable.push({
                                topicLabel: topicLabel,
                                w3schoolsPage: w3schoolsPage,
                                mongodbMethod: mongodb_methods[w3schoolsPage]
                            });

                            if (countOfNodeTopics == (i + 1)) {
                                res.send(nodeTopicsTable);
                            }

                        } else {
                            var matches = [];
                            HttpRequest('https://www.w3schools.com/nodejs/' + w3schoolsPage, function(error, response, body) {
                                //console.log('error:', error); // Print the error if one occurred
                                //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                                //console.log('body:', body); // Print the HTML for the Google homepage.

                                // Process html...
                                // grab the modules from require('http')
                                var regex = /require\('(.*?)'\)/g;
                                while (m = regex.exec(body)) {

                                    if (!m[1].includes('.') && nameNotInArray(matches, m[1])) {
                                        matches.push({
                                            name: m[1],
                                            span: '<span class="unchecked fake-link" data-module-name="' + m[1] + '">' + m[1] + '</span>',
                                            href: 'https://nodejs.org/dist/latest-v9.x/docs/api/' + m[1] + '.html',
                                            link: '<a href="https://nodejs.org/dist/latest-v9.x/docs/api/' + m[1] + '.html">' + m[1] + '</a>'
                                        });
                                    }
                                }

                                nodeTopicsTable.push({
                                    topicLabel: topicLabel.replace('File System', 'File Handling'),
                                    w3schoolsPage: w3schoolsPage,
                                    'nodejsModules': matches
                                });

                                if (countOfNodeTopics == (i + 1)) {
                                    res.send(nodeTopicsTable);
                                }

                            });
                        } // non-DB topic

                    }
                });

                // response normally goes here

            }); // end reqPromise

    } else if (req.body.table_to_scrape) {
        var options = {
            url: 'https://www.w3schools.com/nodejs/ref_modules.asp',
            transform: body => cheerio.load(body)
        };
        var nodeTopicsTable = [];

        reqPromise(options)
            .then(function($) {
                const w3NodeTopicsExist = $('#main .w3-table-all').length != 0;
                const w3NodeTopics = w3NodeTopicsExist ? $('#main .w3-table-all tbody tr td a') : 'page not found';

                // loop through all the links, pull out the text and href
                var countOfNodeTopics = $(w3NodeTopics).length;
                var dontDuplicate = [];
                $(w3NodeTopics).each(function(i, elem) {

                    // old: nodeTopicsTable.push({ topicLabel: module_topics[$(this).text()], w3schoolsPage: $(this).attr('href') });
                    // begin new:
                    var topicLabel = $(this).text();
                    var w3schoolsPage = $(this).attr('href');

                    var matches = [];
                    HttpRequest('https://www.w3schools.com/nodejs/' + w3schoolsPage, function(error, response, body) {
                        //console.log('error:', error); // Print the error if one occurred
                        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                        //console.log('body:', body); // Print the HTML for the Google homepage.

                        // Process html...
                        // grab the modules from require('http')
                        var regex = /require\('(.*?)'\)/g;
                        var moduleCt = 0;
                        while (m = regex.exec(body)) {

                            if (!m[1].includes('.') && nameNotInArray(matches, m[1]) && (moduleCt == 0 || !dontDuplicate.includes(m[1]))) {
                                moduleCt++;
                                dontDuplicate.push(m[1]);
                                matches.push({
                                    name: m[1],
                                    span: '<span class="unchecked fake-link" data-module-name="' + m[1] + '">' + m[1] + '</span>',
                                    href: 'https://nodejs.org/dist/latest-v9.x/docs/api/' + m[1] + '.html',
                                    link: '<a href="https://nodejs.org/dist/latest-v9.x/docs/api/' + m[1] + '.html">' + m[1] + '</a>'
                                });
                            }

                        }

                        nodeTopicsTable.push({
                            topicLabel: module_topics[topicLabel],
                            w3schoolsPage: w3schoolsPage,
                            'nodejsModules': matches
                        });

                        if (countOfNodeTopics == (i + 1)) {
                            res.send(nodeTopicsTable);
                        }

                    });
                    // end new
                });

                //res.send(nodeTopicsTable);

            }); // end reqPromise

    } else if (req.body.page_to_scrape) {

    }

});

app.get('/Screen-Scraping-Node-Topics', function(request, response) {
    response.render('pages/Screen-Scraping-Node-Topics');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
