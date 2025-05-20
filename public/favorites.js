import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js"; // Импортируем getAuth и onAuthStateChanged

document.addEventListener("DOMContentLoaded", async function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBIF6s94-IuXl3accPXPQzVYWYciO5D5lg",
        authDomain: "super-app-1872b.firebaseapp.com",
        projectId: "super-app-1872b",
        storageBucket: "super-app-1872b.appspot.com",
        messagingSenderId: "19947702298",
        appId: "1:19947702298:web:6d962472fbb3a92b5c69a3",
        measurementId: "G-5PMEEJFMDT"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app); // Инициализируем Auth

    const favoritesListDiv = document.getElementById("favorites-list");
    const noFavoritesMessage = document.getElementById("no-favorites-message");
    let currentUserId = null; // Переменная для хранения UID текущего пользователя

    // Слушаем изменение состояния аутентификации
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Пользователь вошел в систему
            currentUserId = user.uid;
            console.log("Пользователь вошел. UID:", currentUserId);
            loadFavorites(); // Загружаем избранное для этого пользователя
        } else {
            // Пользователь вышел из системы
            currentUserId = null;
            console.log("Пользователь не вошел.");
            favoritesListDiv.innerHTML = ""; // Очищаем список
            noFavoritesMessage.textContent = "Войдите в систему, чтобы просмотреть понравившиеся треки.";
            noFavoritesMessage.style.display = "block";
        }
    });

    async function loadFavorites() {
        favoritesListDiv.innerHTML = ""; // Очищаем список перед загрузкой
        noFavoritesMessage.style.display = "none"; // Скрываем сообщение по умолчанию

        if (!currentUserId) {
            noFavoritesMessage.textContent = "Войдите в систему, чтобы просмотреть понравившиеся треки.";
            noFavoritesMessage.style.display = "block";
            return;
        }

        const userFavoritesRef = doc(db, "favorites", currentUserId);
        try {
            const docSnap = await getDoc(userFavoritesRef);
            if (docSnap.exists()) {
                const favorites = docSnap.data().tracks || [];
                if (favorites.length === 0) {
                    noFavoritesMessage.textContent = "У вас пока нет понравившихся треков.";
                    noFavoritesMessage.style.display = "block";
                    return;
                }
                favorites.forEach(track => {
                    const trackCard = document.createElement("div");
                    trackCard.classList.add("favorite-track-card");
                    trackCard.innerHTML = `
                        <img src="${track.img}" alt="${track.song}">
                        <h3>${track.song}</h3>
                        <p>Исполнитель: ${track.artist}</p>
                        <p>Дата выхода: ${track.date}</p>
                        <p>Длительность: ${track.duration}</p>
                        <iframe frameborder="0" allow="clipboard-write" style="border:none;width:100%;height:130px;" src="${track.yandexLink}"></iframe>
                        <button class="remove-favorite-btn" data-song='${JSON.stringify(track)}'>Удалить из избранного</button>
                    `;
                    favoritesListDiv.appendChild(trackCard);
                });

                // Добавляем слушателей на кнопки удаления
                document.querySelectorAll(".remove-favorite-btn").forEach(button => {
                    button.addEventListener("click", async (event) => {
                        const trackToRemove = JSON.parse(event.target.dataset.song);
                        await removeFavorite(trackToRemove);
                    });
                });

            } else {
                noFavoritesMessage.textContent = "У вас пока нет понравившихся треков.";
                noFavoritesMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Ошибка при загрузке понравившихся треков:", error);
            noFavoritesMessage.textContent = "Произошла ошибка при загрузке треков.";
            noFavoritesMessage.style.display = "block";
        }
    }

    async function removeFavorite(track) {
        if (!currentUserId) {
            alert("Для удаления из избранного необходимо быть авторизованным.");
            return;
        }
        const userFavoritesRef = doc(db, "favorites", currentUserId);
        try {
            await updateDoc(userFavoritesRef, {
                tracks: arrayRemove(track)
            });
            alert(`${track.song} удален из понравившихся.`);
            loadFavorites(); // Перезагружаем список после удаления
        } catch (error) {
            console.error("Ошибка при удалении из понравившихся:", error);
            alert("Произошла ошибка при удалении из понравившихся.");
        }
    }

    // Загружаем избранные треки только после того, как узнаем UID пользователя
    // onAuthStateChanged позаботится об этом.
});