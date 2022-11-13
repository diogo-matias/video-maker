const state = require("./save-load");
const { google } = require("googleapis");
const customSearch = google.customsearch("v1");
const download = require("image-downloader");

const googleCredentials = require("../googleCredentials.json");

const alfabeto = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "y",
  "z",
];

async function images() {
  const content = state.load();

  console.log("downloading images...");
  await searchImages();
  await downloadAllImages();

  async function searchImages() {
    let index = 0;
    for (const sentence of content.sentences) {
      index = index + 1;

      if (!sentence.keywords.length) {
        sentence.keywords = [alfabeto[index]];
      }
      const searchQuery = `${content.searchTerm} ${sentence.keywords[0]}`;
      const imagesLinks = await searchOnGoogleAndReturnImageLinks(searchQuery);

      sentence.images = imagesLinks;
      sentence.googleImagesSearch = searchQuery;
    }
  }

  async function searchOnGoogleAndReturnImageLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleCredentials.apiKey,
      cx: googleCredentials.searchEngineId,
      q: `${query}`,
      num: 2,
      searchType: "image",
      imgSize: "huge",
    });

    const result = response.data.items.map((item) => {
      return item.link;
    });

    return result;
  }

  async function downloadAllImages() {
    content.downloadedImages = [];

    for (
      let indexSentences = 0;
      indexSentences < content.sentences.length;
      indexSentences++
    ) {
      const images = content.sentences[indexSentences].images;

      for (let indexImages = 0; indexImages < images.length; indexImages++) {
        const imageUrl = images[indexImages];
        try {
          await downloadImage(imageUrl, `${indexSentences}-original.png`);

          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error(`IMAGE ALREADY DOWNLOADED, URL? ${imageUrl}`);
          }

          content.downloadedImages.push(imageUrl);
          console.log(
            `[${indexSentences}][${indexImages}] SUCESS!, url: ${imageUrl}`
          );
          break;
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  }

  async function downloadImage(imageUrl, fileName) {
    return download.image({
      url: imageUrl,
      dest: `../../content/${fileName}`,
    });
  }

  state.save(content);
}

module.exports = images;
