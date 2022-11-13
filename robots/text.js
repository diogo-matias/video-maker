const axios = require("axios");
const { convert } = require("html-to-text");
const OneAI = require("oneai");
const tokenizer = require("sbd");
const state = require("./save-load");

async function text() {
  // TODO
  // colocar o numero de sentenças em uma variavel
  const content = state.load();
  content.sourceContentOriginal = await getTextFromWikipedia();
  content.sentences = await createSentences(content.sourceContentOriginal);
  state.save(content);

  async function getTextFromWikipedia() {
    try {
      const response = await axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
          disableeditsection: false,
          action: "query",
          format: "json",
          prop: "links|images|extlinks|imageinfo|info|url|extracts|text",
          iiprop: "timestamp|user|url|comment",
          meta: "url",
          origin: "*",
          iwurl: 1,
          titles: `${content.searchTerm}`,
          redirects: 1,
          inprop: "url",
        },
      });

      const stractResult = Object.values(response.data.query.pages)[0];
      const htmlConverted = convert(stractResult.extract);

      return htmlConverted;
    } catch (error) {
      console.log("WIKIPEDIA API FAIL");
      // console.log(error.message);
      return "FAIL TO GET DATA";
    }
  }

  async function getKeyWords(sentence) {
    try {
      const oneai = new OneAI("800a084b-d18c-4817-b222-ea758dfda198");
      const text = sentence;

      const pipeline = new oneai.Pipeline(oneai.skills.keywords());
      const response = await pipeline.run(text);

      if (!response.keywords.length) {
        return [];
      }

      const returnResponse = response.keywords.map((item) => {
        return item.name;
      });

      return returnResponse;
    } catch (error) {
      console.log("KEY WORD ERROR");
    }
  }

  async function createSentences(originalText) {
    const returnObject = [];

    var options = {
      newline_boundaries: false,
      html_boundaries: false,
      sanitize: true,
      allowed_tags: false,
      preserve_whitespace: false,
      abbreviations: null,
    };

    var text = originalText;
    var sentences = tokenizer.sentences(text, options);

    const promisses = sentences.map(async (item, index) => {
      if (index > 20) {
        return;
      }

      returnObject.push({
        text: item,
        keywords: await getKeyWords(item),
        images: [],
      });
    });

    await Promise.all(promisses);
    return returnObject;
  }
}

// PEGA INFORMAÇOES DE UMA PAGINA DO WIKIPEDIA OK
// TRANFORMA ESSE TEXTO EM ALGO LEGIVEL OK
// FAZ UM RESUMO DO TEXTO

module.exports = text;
