const robots = {
  userInput: require("./robots/user-input"),
  text: require("./robots/text"),
  state: require("./robots/save-load"),
  images: require("./robots/images"),
};

async function start() {
  robots.userInput();
  await robots.text();
  await robots.images();

  const content = robots.state.load();
  // console.dir(content);
}

start();
