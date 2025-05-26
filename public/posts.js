import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase конфигурация (из config.js)
const firebaseConfig = {
    apiKey: "AIzaSyBIF6s94-IuXl3accPXPQzVYWYciO5D5lg",
    authDomain: "super-app-1872b.firebaseapp.com",
    projectId: "super-app-1872b",
    storageBucket: "super-app-1872b.appspot.com",
    messagingSenderId: "19947702298",
    appId: "1:19947702298:web:6d962472fbb3a92b5c69a3",
    measurementId: "G-5PMEEJFMDT"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Получаем ссылки на модальные окна и элементы
const postModal = document.getElementById("post-modal");
const mainModal = document.getElementById("modal"); // Это ваше второе модальное окно

// Глобальные функции для открытия/закрытия модальных окон
// Эти функции должны быть доступны глобально, так как они вызываются из onclick в HTML
window.openPostModal = function () {
    if (postModal) {
        postModal.style.display = "block";
    }
};

window.closePostModal = function () {
    if (postModal) {
        postModal.style.display = "none";
    }
};

// Функция для открытия основного модального окна (из modal-window.js, но на всякий случай продублирую)
// Если у вас уже есть openModal/closeModal в modal-window.js,
// убедитесь, что они тоже глобальные или вызывают их через addEventListener.
window.openModal = function () {
    if (mainModal) {
        mainModal.style.display = "block";
    }
};

window.closeModal = function () {
    if (mainModal) {
        mainModal.style.display = "none";
    }
};


document.addEventListener("DOMContentLoaded", function () {
    const headerText = document.getElementById("header-text");
    // const newsText = document.getElementById("news-text"); // Удален, так как его нет в новом HTML
    // const comingSoonText = document.getElementById("coming-soon"); // Удален, так как его нет в новом HTML
    const postForm = document.getElementById("post-form");
    const postsContainer = document.getElementById("posts-container");

    let currentUserUid = null;
    let unsubscribe; // Слушатель изменений коллекции заметок

    // Анимации заголовков и текстов, если они есть
    // Убедитесь, что элементы с ID "news-text" и "coming-soon" существуют в HTML
    // Если их нет, этот код будет вызывать ошибки.
    // Судя по последнему HTML, эти элементы были удалены.
    // Если они нужны, добавьте их обратно в HTML.
    // Если они больше не используются, удалите этот блок.

    // Пример адаптации, если newsText и comingSoonText все же нужны
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");

    if (headerText) { // Проверяем, существует ли элемент, прежде чем добавлять слушателя
        headerText.addEventListener("animationend", function () {
            if (newsText) {
                newsText.style.display = "block";
                newsText.style.animationPlayState = "running";
            }
        });
    }

    if (newsText) { // Проверяем, существует ли элемент
        newsText.addEventListener("animationend", function () {
            if (comingSoonText) {
                comingSoonText.style.display = "block";
                comingSoonText.style.animationPlayState = "running";
            }
        });
    }


    // Обработчик изменения состояния авторизации
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserUid = user.uid;
            loadPosts(currentUserUid); // Загружаем заметки при авторизации
        } else {
            currentUserUid = null;
            postsContainer.innerHTML = ""; // Очищаем заметки при выходе
            if (unsubscribe) {
                unsubscribe(); // Отписываемся от слушателя
            }
        }
    });

    // Обработка формы добавления поста
    if (postForm) { // Проверяем, существует ли форма
        postForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const titleInput = document.getElementById("title");
            const descriptionInput = document.getElementById("description");

            const title = titleInput.value;
            const description = descriptionInput.value;

            if (currentUserUid) {
                addPost({ title, description, uid: currentUserUid });
                closePostModal();
                titleInput.value = ""; // Очищаем поля формы
                descriptionInput.value = "";
            } else {
                alert("Пожалуйста, войдите в аккаунт, чтобы добавить заметку.");
            }
        });
    }


    // Функция добавления поста в Firebase
    async function addPost(post) {
        try {
            const notesCollectionRef = collection(db, "notes");
            const docRef = await addDoc(notesCollectionRef, post); // Получаем DocumentReference
            console.log("Заметка добавлена с ID: ", docRef.id);
        } catch (error) {
            console.error("Ошибка при добавлении заметки: ", error);
            alert("Произошла ошибка при добавлении заметки.");
        }
    }

    // Функция отображения поста на странице
    function displayPost(post) {
        const postElement = document.createElement("div");
        postElement.className = "post";
        // Убедитесь, что post.nickname существует, если вы хотите его отображать.
        // В вашем текущем HTML и JS, nickname не добавляется в пост.
        // Если он нужен, его нужно добавить при создании поста (addPost).
        postElement.innerHTML = `
            <div class="title">${post.title}</div>
            <div class="description">${post.description}</div>
            <button class="delete-btn" onclick="confirmDelete('${post.id}')">Удалить</button>
        `;
        postsContainer.appendChild(postElement);
    }

    // Функция подтверждения удаления поста
    // Эта функция также должна быть глобальной, так как вызывается из onclick
    window.confirmDelete = function (postId) {
        const confirmAction = confirm("Вы уверены, что хотите удалить эту запись? Вы не сможете её восстановить!");
        if (confirmAction) {
            deletePost(postId);
        }
    };

    // Функция удаления поста из Firebase
    async function deletePost(postId) {
        try {
            const noteDocRef = doc(db, "notes", postId);
            await deleteDoc(noteDocRef);
            console.log("Заметка удалена с ID: ", postId);
        } catch (error) {
            console.error("Ошибка при удалении заметки: ", error);
            alert("Произошла ошибка при удалении заметки.");
        }
    }

    // Функция загрузки постов из Firebase для текущего пользователя и подписка на обновления
    function loadPosts(uid) {
        postsContainer.innerHTML = ""; // Очищаем контейнер перед загрузкой
        const q = query(collection(db, "notes"), where("uid", "==", uid));

        unsubscribe = onSnapshot(q, (querySnapshot) => {
            postsContainer.innerHTML = ""; // Очищаем контейнер при каждом обновлении
            querySnapshot.forEach((doc) => {
                displayPost({ id: doc.id, ...doc.data() });
            });
        }, (error) => {
            console.error("Ошибка при получении заметок: ", error);
            alert("Произошла ошибка при загрузке заметок.");
        });
    }
});