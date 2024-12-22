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
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
        process.exit(1);
    }
    console.log("Успешное подключение к базе данных.");
});

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL
        )`,
        (err) => {
            if (err) {
                console.error("Ошибка при создании таблицы:", err.message);
            } else {
                console.log("Таблица posts готова.");
            }
        }
    );
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Сохранение поста
app.post('/save-post', (req, res) => {
    const { nickname, title, description } = req.body;
    if (!nickname || !title || !description) {
        return res.status(400).send("Все поля (nickname, title, description) обязательны для заполнения.");
    }

    db.run(
        "INSERT INTO posts (nickname, title, description) VALUES (?, ?, ?)",
        [nickname, title, description],
        function (err) {
            if (err) {
                console.error("Ошибка при сохранении поста:", err.message);
                return res.status(500).send("Ошибка при сохранении поста.");
            }
            res.status(200).send({ message: "Пост сохранен", id: this.lastID });
        }
    );
});

// Загрузка постов
app.get('/load-posts', (req, res) => {
    db.all("SELECT * FROM posts ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error("Ошибка при загрузке постов:", err.message);
            return res.status(500).send("Ошибка при загрузке постов.");
        }
        res.json(rows);
    });
});

// Удаление поста
app.delete('/delete-post/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM posts WHERE id = ?", [id], function (err) {
        if (err) {
            console.error("Ошибка при удалении поста:", err.message);
            return res.status(500).send("Ошибка при удалении поста.");
        }
        if (this.changes === 0) {
            return res.status(404).send("Пост не найден.");
        }
        res.status(200).send("Пост успешно удален.");
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const API_URL = "https://supper-app-two.vercel.app"; // Адрес сервера API

document.addEventListener("DOMContentLoaded", function () {
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");
    const postForm = document.getElementById("post-form");
    const postsContainer = document.getElementById("posts-container");

    headerText.addEventListener("animationend", function () {
        newsText.style.display = "block";
        newsText.style.animationPlayState = "running";
    });

    newsText.addEventListener("animationend", function () {
        comingSoonText.style.display = "block";
        comingSoonText.style.animationPlayState = "running";
    });

    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const nickname = document.getElementById("nickname").value;
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        addPost({ nickname, title, description });
        closePostModal();
    });

    function addPost(post) {
        fetch(`${API_URL}/save-post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        })
            .then((response) => {
                if (!response.ok) throw new Error("Ошибка при сохранении поста");
                return response.json();
            })
            .then((data) => {
                console.log(data);
                displayPost(post);
            })
            .catch((error) => console.error("Ошибка:", error));
    }
    
    // Обновленная функция для отображения постов
    function displayPost(post) {
        const postsContainer = document.getElementById("posts-container");
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
            <img src="./assets/user-icon.png" alt="Home" class="user-icon">
            <div class="nickname">Никнейм: ${post.nickname}</div>
            <div class="title">Тема: ${post.title}</div>
            <div class="description">${post.description}</div>
        `;
        postsContainer.appendChild(postElement);
    }

    // Загружаем посты при загрузке страницы
    document.addEventListener("DOMContentLoaded", loadPosts);

    function loadPosts() {
        fetch(`${API_URL}/load-posts`)
            .then((response) => {
                if (!response.ok) throw new Error("Ошибка при загрузке постов");
                return response.json();
            })
            .then((posts) => {
                postsContainer.innerHTML = "";
                posts.forEach((post) => displayPost(post));
            })
            .catch((error) => console.error("Ошибка:", error));
    }

    loadPosts();
});

function openPostModal() {
    document.getElementById("post-modal").style.display = "block";
}

function closePostModal() {
    document.getElementById("post-modal").style.display = "none";
}
