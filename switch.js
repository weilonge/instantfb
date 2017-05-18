var Crawler = require("crawler");

var SwitchCrawler = {};

SwitchCrawler.tasks = [
  'https://www.amazon.co.jp/gp/offer-listing/B01NCXFWIZ/', // color
  'https://www.amazon.co.jp/gp/offer-listing/B01N5QLLT3/', // normal
  'https://www.amazon.co.jp/gp/offer-listing/B01N5QLOHD/', // color + screen
  'https://www.amazon.co.jp/gp/offer-listing/B01NBW07L4/', // normal + screen
  'https://www.amazon.co.jp/gp/offer-listing/B01N356LAU/', // color + black case
  'https://www.amazon.co.jp/gp/offer-listing/B01NCX1VU6/', // normal + black case
  'https://www.amazon.co.jp/gp/offer-listing/B01N9SYM66/', // color + blue case
  'https://www.amazon.co.jp/gp/offer-listing/B01NAU8B71/', // normal + blue case
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
        let seller = $(this).find(".olpSellerName > span.a-text-bold > a").text();

        item.price = parseInt(priceText.replace(/[￥,]/u, '').replace(/[￥,]/u, ''));
        item.textFulfilledByAmazon = fulfilledByAmazonText;
        item.isFulfilledByAmazon = !!item.textFulfilledByAmazon;
        item.seller = seller;
        item.isAmazonJP = item.seller.includes("Amazon");
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

