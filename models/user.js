/** User class for message.ly */
const bcrypt = require("bcrypt");
const db = require("../db")
const { BCRYPT_WORK_FACTOR } = require("../config")

/** User of the site. */

class User {

  constructor({username, first_name, last_name, phone}) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  async register(password) { 
    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const joinAt = new Date(), lastLoginAt = new Date();
      const query = await db.query(
        `INSERT INTO users 
          (username, password, first_name, last_name, phone, join_at, last_login_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING username, password, first_name, last_name, phone`,
          [this.username, hashedPassword, this.first_name, this.last_name, this.phone, joinAt, lastLoginAt]
      );
      return query.rows[0];
    } catch (error) {
      return error;
    }
}

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const query = await db.query(`SELECT * FROM users WHERE username=$1`, [username])
      const user = query.rows[0];
      const matched = await bcrypt.compare(password, user.password);
      return matched;
    } catch (error) {
      throw error;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const timeStamp = new Date();
    try {
      await db.query(
        `UPDATE users SET last_login_at=$1 WHERE username=$2`,
        [timeStamp, username]
      );
    } catch (error) {
      throw error;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    try {
      const users = await db.query(`SELECT * from users`);
      return users.rows;
    } catch (error) {
      throw error;
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const user = await db.query(
        `SELECT username, first_name, last_name, phone, join_at, last_login_at
          FROM users WHERE username = $1`, [username]
      );
      if (user.rows.length === 0) {
        return "User not found";
      }
      return user.rows[0];
    } catch (error) {
      throw error;
    }
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const query = await db.query(
      `SELECT 
          m.id, m.body, m.sent_at, m.read_at, 
          u.username, u.first_name, u.last_name, u.phone
        FROM 
          messages m
        LEFT JOIN 
          users u
        ON 
          m.to_username = u.username
        WHERE 
          m.from_username = $1;`,
      [username]
    );

    if (query.rows.length === 0) {
      return  "No messages";
    }

    const messages = []

    query.rows.forEach(row => {
      const message = {}, user = {};
      Object.entries(row).forEach((col, i) => {
        if (i < 4)
          message[col[0]] = col[1]
        else 
          user[col[0]] = col[1]
      });
      message['to_user'] = user;
      messages.push(message);
    });

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const query = await db.query(
      `SELECT 
          m.id, m.body, m.sent_at, m.read_at, 
          u.username, u.first_name, u.last_name, u.phone
        FROM 
          messages m
        LEFT JOIN 
          users u
        ON 
          m.from_username = u.username
        WHERE 
          m.to_username = $1`,
      [username]
    );

    if (query.rows.length === 0) {
      return "User not found";
    }

    const messages = []
    query.rows.forEach(row => {
      const message = {}, user = {};
      Object.entries(row).forEach((col, i) => {
        if (i < 4)
          message[col[0]] = col[1]
        else 
          user[col[0]] = col[1]
      });
      message['from_user'] = user;
      messages.push(message);
    });

    return messages;
  }

  static async userExists(username) {
    const query = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (query.rows.length === 0) {
      return false;
    }
    return true;
  }
}


module.exports = User;