const dotenv = require("dotenv");
dotenv.config();
const db = require("./config/dbConfig");
const server = require("./app");

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
