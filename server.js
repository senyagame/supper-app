const express = require('express');
const cors = require('cors'); // Подключаем CORS
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// Подключение CORS
app.use(cors());

// Создание базы данных и таблицы
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, title TEXT, description TEXT)");
});

app.use(express.json());
app.use(express.static('public'));

// Сохранение поста
app.post('/save-post', (req, res) => {
    const { nickname, title, description } = req.body;
    db.run("INSERT INTO posts (nickname, title, description) VALUES (?, ?, ?)", [nickname, title, description], function (err) {
        if (err) {
            return res.status(500).send("Ошибка при сохранении поста");
        }
        res.status(200).send("Пост сохранен");
    });
});

// Загрузка постов
app.get('/load-posts', (req, res) => {
    db.all("SELECT * FROM posts", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Ошибка при загрузке постов");
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});