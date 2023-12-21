const bcrypt = require("bcrypt");
const db = require("./db")
const { BCRYPT_WORK_FACTOR } = require("./config")

const userData = [
    { username: 'user1', password: 'pass1', first_name: 'John', last_name: 'Doe', phone: '123-456-7890', join_at: '2023-01-01 12:00:00', last_login_at: '2023-01-02 18:30:00' },
    { username: 'user2', password: 'pass2', first_name: 'Jane', last_name: 'Smith', phone: '987-654-3210', join_at: '2023-01-03 09:45:00', last_login_at: '2023-01-04 15:20:00' },
    { username: 'user3', password: 'pass3', first_name: 'Alice', last_name: 'Jones', phone: '555-123-4567', join_at: '2023-01-05 14:30:00', last_login_at: null },
    { username: 'user4', password: 'pass4', first_name: 'Bob', last_name: 'Jackson', phone: '789-321-6540', join_at: '2023-01-06 10:15:00', last_login_at: null },
    { username: 'user5', password: 'pass5', first_name: 'Eva', last_name: 'Brown', phone: '111-222-3333', join_at: '2023-01-07 08:00:00', last_login_at: '2023-01-07 12:30:00' },
    { username: 'user6', password: 'pass6', first_name: 'Michael', last_name: 'Smith', phone: '444-555-6666', join_at: '2023-01-08 17:30:00', last_login_at: null },
    { username: 'user7', password: 'pass7', first_name: 'Emily', last_name: 'Johnson', phone: '777-888-9999', join_at: '2023-01-09 14:00:00', last_login_at: null },
    { username: 'user8', password: 'pass8', first_name: 'David', last_name: 'Miller', phone: '666-555-4444', join_at: '2023-01-10 11:45:00', last_login_at: '2023-01-10 15:20:00' },
    { username: 'user9', password: 'pass9', first_name: 'Sophia', last_name: 'Williams', phone: '999-888-7777', join_at: '2023-01-11 10:30:00', last_login_at: null },
    { username: 'user10', password: 'pass10', first_name: 'James', last_name: 'Taylor', phone: '222-333-4444', join_at: '2023-01-12 09:15:00', last_login_at: null }
];

const messages = [
    'The sun sets in the west every evening.',
    'Coding is both an art and a science.',
    'Music has the power to heal and inspire.',
    'Coffee is a magical potion for productivity.',
    'The universe is vast and full of mysteries.',
    'Laughter is the best medicine for the soul.',
    'Nature has a way of restoring inner peace.',
    'Learning is a lifelong adventure.',
    'Kindness costs nothing but means everything.',
    'Time flies when you\'re having fun.',
    'Success is a journey, not a destination.',
    'Dream big, work hard, stay focused.',
    'The early bird catches the worm.',
    'A smile can brighten someone\'s day.',
    'Books are windows to other worlds.',
    'Adventure awaits at every corner.',
    'Challenges are opportunities in disguise.',
    'Creativity knows no bounds.',
    'Traveling broadens the mind.',
    'Rainy days are perfect for cozy reading.',
    'Friendship is a treasure beyond gold.',
    'A healthy mind resides in a healthy body.',
    'Technology connects us in amazing ways.',
    'Mistakes are stepping stones to success.',
    'The best is yet to come.',
    'Life is a beautiful and wild ride.',
    'Silence can speak volumes.',
    'Joy is found in the little things.',
    'Courage is not the absence of fear but the triumph over it.',
    'Imagination is the key to innovation.'
];

async function populateTables() {
    const users = await db.query("SELECT * FROM users");
    const messages = await db.query("SELECT * FROM messages");
    if (users.rows.length === 0) {
        for (const i in userData) {
            const hashedPassword = await bcrypt.hash(userData[i].password, BCRYPT_WORK_FACTOR);
            const userQuery = `
              INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const userValues = [
                userData[i].username, 
                hashedPassword, 
                userData[i].first_name, 
                userData[i].last_name, 
                userData[i].phone, 
                userData[i].join_at, 
                userData[i].last_login_at
            ];
            await db.query(userQuery, userValues);
        }
    }
    if (messages.rows.length === 0) {
        for (const i in messages) {
            const start = new Date(2018, 0, 1);
            const end = new Date();
            const sentAt = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            const u1 = Math.floor(Math.random() * 10)
            let u2 = Math.floor(Math.random() * 10)
            while ( u2 === u1) {
                u2 = Math.floor(Math.random() * 10)
            }
            const messageQuery = `
                INSERT INTO messages (from_username, to_username, body, sent_at, read_at)
                VALUES ($1, $2, $3, $4, $5)
            `;
            const messageValues = [userData[u1].username, userData[u2].username, messages[i], sentAt, null];
            await db.query(messageQuery, messageValues);
        }
    }
}

module.exports = populateTables;