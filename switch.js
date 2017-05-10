var Crawler = require("crawler");

var SwitchCrawler = {};

SwitchCrawler.tasks = [
  'https://www.amazon.co.jp/gp/offer-listing/B01NCXFWIZ/ref=olp_f_freeShipping?ie=UTF8&f_new=true',
  'https://www.amazon.co.jp/gp/offer-listing/B01N5QLLT3/ref=dp_olp_new?ie=UTF8&condition=new',
];

SwitchCrawler.run = function (retryInterval, notifyMe) {
  var c = new Crawler({
    rateLimit: retryInterval, // `maxConnections` will be forced to 1
    callback: function(err, res, done){
      let $ = res.$;
      let title = $("title").text();
      let itemElementList = $(".a-row.a-spacing-mini.olpOffer");
      let items = [];
      itemElementList.map(function (i, el) {
        let item = {};
        let priceText = $(this).find(".a-size-large.a-color-price.olpOfferPrice.a-text-bold").text();
        let fulfilledByAmazonText = $(this).find(".olpDeliveryColumn > .olpBadgeContainer > .olpBadge a.a-declarative").text().trim();
        item.price = parseInt(priceText.replace(/[￥,]/u, '').replace(/[￥,]/u, ''));
        item.textFulfilledByAmazon = fulfilledByAmazonText;
        item.isFulfilledByAmazon = !!item.textFulfilledByAmazon;
        items.push(item);
      });
      notifyMe(title, items, res).then(() => {
        done();
      });
    }
  });
  
  c.on('drain', () => {
    c.queue(SwitchCrawler.tasks);
  });

  c.queue(SwitchCrawler.tasks);//between two tasks, minimum time gap is 1000 (ms)
};

module.exports = SwitchCrawler;

