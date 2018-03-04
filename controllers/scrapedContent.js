var mongoose = require('mongoose');
var Content = mongoose.model('ScrapedContent');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/* POST a new scrapedContent */
/* /api/scrapedContent */
module.exports.scrapedContentUpdateByName = function(req, res) {

  Content
    .findOne({ name : "Node Topics" })
    .exec(function(err, scrapedContent) {

      if (!scrapedContent) {

        console.log("Server-API: Here is the body: ", req.body);
        Content.create({
          name: req.body.name,
          html: req.body.html
        }, function(err, scrapedContent) {
          if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
          } else {
            console.log("Here is created scrapedContent: ", scrapedContent);
            sendJSONresponse(res, 201, scrapedContent);
          }
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      scrapedContent.html = req.body.html;

      scrapedContent.save(function(err, location) {
        if (err) {
          sendJSONresponse(res, 404, err);
        } else {
          sendJSONresponse(res, 200, location);
        }
      });

    });
  
};

module.exports.scrapedContentFindByName = function(scrapedContentName) {
  if (scrapedContentName) {
    console.log("Finding scrapedContent with name " + scrapedContentName);

    Content
      .findOne({ name : scrapedContentName })
      .exec(function(err, scrapedContent) {

        if (!scrapedContent) {
          return {
            "message": "scrapedContent by name not found"
          };
        } else if (err) {
          console.log(err);
          return {
            "message": "There was an error: " + err
          };
        }
        console.log("Controller scrapedContentFindByName success!", scrapedContent);

        return scrapedContent;

      });

  } else {
    return {
      "message": "Name not provided in request"
    };
  }
};

