var Crawler = require("crawler");

var SwitchOfficialCrawler = {};

SwitchOfficialCrawler.tasks = [
  'https://store.nintendo.co.jp/customize.html',
];

SwitchOfficialCrawler.run = function (retryInterval, notifyMe) {
  var c = new Crawler({
    rateLimit: retryInterval, // `maxConnections` will be forced to 1
    callback: function(err, res, done){
      let $ = res.$;
      let title = $("title").text();
      //let itemElementList = $(".a-row.a-spacing-mini.olpOffer");
      let items = [];
//      itemElementList.map(function (i, el) {
        //let item = {};
        //let priceText = $(this).find(".a-size-large.a-color-price.olpOfferPrice.a-text-bold").text();
        //let fulfilledByAmazonText = $(this).find(".olpDeliveryColumn > .olpBadgeContainer > .olpBadge a.a-declarative").text().trim();
        //let seller = $(this).find(".olpSellerName > span.a-text-bold > a").text();

        //item.price = parseInt(priceText.replace(/[￥,]/u, '').replace(/[￥,]/u, ''));
        //item.textFulfilledByAmazon = fulfilledByAmazonText;
        //item.isFulfilledByAmazon = !!item.textFulfilledByAmazon;
        //item.seller = seller;
        //item.isAmazonJP = item.seller.includes("Amazon");
        //items.push(item);
//      });
      notifyMe(title, items, res).then(() => {
        done();
      });
    }
  });

  c.on('drain', () => {
    c.queue(SwitchOfficialCrawler.tasks);
  });

  c.queue(SwitchOfficialCrawler.tasks);//between two tasks, minimum time gap is 1000 (ms)
};

module.exports = SwitchOfficialCrawler;

