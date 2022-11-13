const readline = require("readline-sync");
const state = require("./save-load");

function userInput() {
  const content = {
    searchTerm: "",
    prefix: "",
    sourceContentOriginal: "",
    sourceContentSumarized: "",
    sentences: [
      {
        text: "",
        keyword: [],
        images: [],
      },
    ],
  };
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();
  state.save(content);

  function askAndReturnSearchTerm() {
    return readline.question("Type a wikipedia search term: ");
  }

  function askAndReturnPrefix() {
    const prefixes = ["Who is", "The history of", "What is"];
    const selectedPrefixIndex = readline.keyInSelect(prefixes);
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }
}

module.exports = userInput;
