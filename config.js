/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://corey:caller1d@localhost/messagely_test"
  : "postgresql://corey:caller1d@localhost/messagely";

const SECRET_KEY = process.env.SECRET_KEY || "fHt$TRcC%25HmE8gC'vD$!Ka%8sOt;~V,XItr+8t+)8;x}O/rSQgGyG7}o^c1')";

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};