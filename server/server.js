const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const db = require("./config/dbConfig");
const server = require("./app");


const port = process.env.PORT_NO || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
