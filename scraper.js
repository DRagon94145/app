const axios = require("axios");
const cheerio = require("cheerio");
const alpha2 = require("iso-3166-1-alpha-2");
const emoji = require("emoji-flags");

const fetchHtml = async (bin) => {
  const response = await axios({
    method: "POST",
    url: "http://bins.su/",
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "upgrade-insecure-requests": "1",
    },
    data: `action=searchbins&bins=${bin}&bank=&country=`,
  });
  return response.data;
};

const NotFound = {
  result: false,
  message: "No results found",
};

const scrape = async (bin) => {
  if (bin.length < 6 || !/^\d+$/.test(bin)) {
    return {
      result: false,
      message: "Request a Valid BIN",
    };
  }

  bin = bin.substr(0, 6);
  let htmlData = await fetchHtml(bin);
  let $ = cheerio.load(htmlData);
  const result = $("#result").html();
  if (!result || !result.match("Total found 1 bins")) {
    return NotFound;
  }

  const country = $("#result tr:nth-child(2) td:nth-child(2)").text();
  const vendor = $("#result tr:nth-child(2) td:nth-child(3)").text();
  const type = $("#result tr:nth-child(2) td:nth-child(4)").text();
  const level = $("#result tr:nth-child(2) td:nth-child(5)").text();
  const bank = $("#result tr:nth-child(2) td:nth-child(6)").text();
  const countryInfo = emoji.countryCode(country);
  return {
    result: true,
    message: "Search Successful",
    data: {
      bin,
      vendor,
      type,
      level,
      bank,
      country: alpha2.getCountry(country).toUpperCase(),
      countryInfo: {
          name: countryInfo.name.toUpperCase(),
          emoji: countryInfo.emoji,
          unicode: countryInfo.unicode,
          code: countryInfo.code,
          dialCode: countryInfo.dialCode
      }
    },
  };
};

exports.scrape = scrape;
