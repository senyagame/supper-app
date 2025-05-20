import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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

    let currentUserId = null; // Переменная для хранения UID текущего пользователя

    // Слушаем изменение состояния аутентификации
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Пользователь вошел в систему
            currentUserId = user.uid;
            console.log("Пользователь вошел. UID:", currentUserId);
            // Если пользователь вошел, обновляем состояние кнопок избранного
            initializeFavoritesButtons();
        } else {
            // Пользователь вышел из системы
            currentUserId = null;
            console.log("Пользователь не вошел.");
            // Если пользователь вышел, деактивируем все кнопки "Добавить в понравившиеся"
            disableAllFavoriteButtons();
        }
    });

    // --- Функционал счетчика прослушиваний (твоя существующая логика) ---
    const playButtons = document.querySelectorAll(".play-btn");

    playButtons.forEach(async (button) => {
        const audioId = button.dataset.player;
        const audio = document.getElementById(audioId);
        const playsElement = document.getElementById(`plays-${audioId}`);
        const progressBar = document.querySelector(`.progress-bar[data-player="${audioId}"]`);

        if (!audio || !progressBar) return;

        const trackDoc = doc(db, "plays", audioId);

        try {
            const trackSnap = await getDoc(trackDoc);
            if (trackSnap.exists() && playsElement) {
                playsElement.textContent = `Прослушиваний: ${trackSnap.data().count}`;
            }
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }

        audio.addEventListener("timeupdate", () => {
            if (!isNaN(audio.duration)) {
                progressBar.value = (audio.currentTime / audio.duration) * 100;
            }
        });

        progressBar.addEventListener("input", () => {
            if (!isNaN(audio.duration)) {
                audio.currentTime = (progressBar.value / 100) * audio.duration;
            }
        });

        button.addEventListener("click", async function () {
            if (!audio.paused) {
                audio.pause();
                this.textContent = "▶";
            } else {
                document.querySelectorAll("audio").forEach((aud) => aud.pause());
                document.querySelectorAll(".play-btn").forEach((btn) => (btn.textContent = "▶"));

                audio.play();
                this.textContent = "❚❚";

                try {
                    const trackSnap = await getDoc(trackDoc);
                    let newCount = trackSnap.exists() ? trackSnap.data().count + 1 : 1;
                    await setDoc(trackDoc, { count: newCount }, { merge: true });

                    if (playsElement) {
                        playsElement.textContent = `Прослушиваний: ${newCount}`;
                    }
                } catch (error) {
                    console.error("Ошибка обновления прослушиваний:", error);
                }
            }
        });
    });

    const togglePlayersButton = document.getElementById("toggle-players");
    if (togglePlayersButton) {
        togglePlayersButton.addEventListener("click", function () {
            document.querySelectorAll("iframe").forEach((el) => el.style.display = "none");
            document.querySelectorAll(".audio-player").forEach((el) => el.style.display = "block");
        });
    }

    // --- Новый функционал "Понравившиеся" ---
    const addFavoriteButtons = document.querySelectorAll(".add-to-favorites-btn");

    function disableAllFavoriteButtons() {
        addFavoriteButtons.forEach(button => {
            button.textContent = "Войдите для добавления";
            button.disabled = true;
            button.classList.add("added-to-favorites"); // Можно использовать этот класс для стилизации неактивной кнопки
        });
    }

    async function initializeFavoritesButtons() {
        if (!currentUserId) {
            disableAllFavoriteButtons();
            return;
        }

        addFavoriteButtons.forEach(async (button) => {
            const musicContainer = button.closest(".music-container");
            const songData = {
                song: musicContainer.dataset.song,
                artist: musicContainer.dataset.artist,
                date: musicContainer.dataset.date,
                duration: musicContainer.dataset.duration,
                img: musicContainer.dataset.img,
                yandexLink: musicContainer.dataset.yandexLink
            };

            await updateFavoriteButtonState(button, songData);

            // Удаляем старые слушатели, чтобы избежать дублирования
            const oldButton = button.cloneNode(true);
            button.parentNode.replaceChild(oldButton, button);
            oldButton.addEventListener("click", async () => {
                if (!currentUserId) {
                    alert("Пожалуйста, войдите в систему, чтобы добавлять треки в избранное.");
                    return;
                }
                const userFavoritesRef = doc(db, "favorites", currentUserId);

                try {
                    await updateDoc(userFavoritesRef, {
                        tracks: arrayUnion(songData)
                    }, { merge: true });
                    alert(`${songData.song} добавлен в понравившиеся!`);
                    await updateFavoriteButtonState(oldButton, songData);
                } catch (error) {
                    if (error.code === 'not-found') {
                        await setDoc(userFavoritesRef, { tracks: [songData] });
                        alert(`${songData.song} добавлен в понравившиеся!`);
                        await updateFavoriteButtonState(oldButton, songData);
                    } else {
                        console.error("Ошибка при добавлении в понравившиеся:", error);
                        alert("Произошла ошибка при добавлении в понравившиеся.");
                    }
                }
            });
        });
    }

    async function updateFavoriteButtonState(button, songData) {
        if (!currentUserId) {
            button.textContent = "Войдите для добавления";
            button.disabled = true;
            button.classList.add("added-to-favorites");
            return;
        }

        const userFavoritesRef = doc(db, "favorites", currentUserId);
        try {
            const docSnap = await getDoc(userFavoritesRef);
            if (docSnap.exists()) {
                const favorites = docSnap.data().tracks || [];
                const isFavorite = favorites.some(fav =>
                    fav.song === songData.song &&
                    fav.artist === songData.artist &&
                    fav.yandexLink === songData.yandexLink
                );
                if (isFavorite) {
                    button.textContent = "В избранном (NEXUS)";
                    button.disabled = true;
                    button.classList.add("added-to-favorites");
                } else {
                    button.textContent = "Добавить в понравившиеся (NEXUS)";
                    button.disabled = false;
                    button.classList.remove("added-to-favorites");
                }
            } else {
                button.textContent = "Добавить в понравившиеся (NEXUS)";
                button.disabled = false;
                button.classList.remove("added-to-favorites");
            }
        } catch (error) {
            console.error("Ошибка при проверке избранного:", error);
            button.textContent = "Ошибка загрузки";
            button.disabled = true;
            button.classList.add("added-to-favorites");
        }
    }

    // Инициализируем кнопки избранного при загрузке страницы (если пользователь уже вошел)
    // Эта функция будет вызвана повторно при изменении состояния аутентификации
    // Initial call to set up buttons based on current auth state (might be null)
    if (auth.currentUser) {
        currentUserId = auth.currentUser.uid;
        initializeFavoritesButtons();
    } else {
        // Если пользователь не авторизован изначально, деактивируем кнопки
        disableAllFavoriteButtons();
    }
});