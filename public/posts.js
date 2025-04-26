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

document.addEventListener("DOMContentLoaded", function () {
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");
    const postForm = document.getElementById("post-form");
    const postsContainer = document.getElementById("posts-container");

    let currentUserUid = null;
    let unsubscribe; // Слушатель изменений коллекции заметок

    // Анимация заголовков
    headerText.addEventListener("animationend", function () {
        newsText.style.display = "block";
        newsText.style.animationPlayState = "running";
    });

    newsText.addEventListener("animationend", function () {
        comingSoonText.style.display = "block";
        comingSoonText.style.animationPlayState = "running";
    });

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
    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        if (currentUserUid) {
            addPost({ title, description, uid: currentUserUid });
            closePostModal();
            document.getElementById("title").value = "";
            document.getElementById("description").value = "";
        } else {
            alert("Пожалуйста, войдите в аккаунт, чтобы добавить заметку.");
        }
    });

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
        postElement.innerHTML = `
            <div class="title">${post.title}</div>
            <div class="description">${post.description}</div>
            <button class="delete-btn" onclick="confirmDelete('${post.id}')">Удалить</button>
        `;
        postsContainer.appendChild(postElement);
    }

    // Функция подтверждения удаления поста
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

    // Открытие и закрытие модального окна
    window.openPostModal = function () {
        document.getElementById("post-modal").style.display = "block";
    };

    window.closePostModal = function () {
        document.getElementById("post-modal").style.display = "none";
    };
});