var mongoose = require('mongoose'), Schema = mongoose.Schema;
// https://github.com/jeromelebel/MongoHub-Mac

var scrapedContentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  html: String,
});

mongoose.model('ScrapedContent', scrapedContentSchema);