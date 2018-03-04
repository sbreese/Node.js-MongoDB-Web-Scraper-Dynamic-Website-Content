var express = require('express');
var router = express.Router();

var ctrlScrapedContent = require('../controllers/scrapedContent');

router.post('/scrapedContent', ctrlScrapedContent.scrapedContentUpdateByName);

module.exports = router;