import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
    const auth = getAuth(app);

    let currentUserId = null;

    // --- Функции для управления кнопками избранного (остались почти без изменений) ---
    const addFavoriteButtons = document.querySelectorAll(".add-to-favorites-btn");

    function disableAllFavoriteButtons() {
        addFavoriteButtons.forEach(button => {
            button.textContent = "Войдите для добавления";
            button.disabled = true;
            button.classList.add("added-to-favorites");
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
                    // Для избранного лучше использовать yandexLink как уникальный идентификатор
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
                yandexLink: musicContainer.dataset.yandexLink // Используем прямую ссылку
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

    // --- Обработчик состояния авторизации Firebase ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("Пользователь вошел. UID:", currentUserId);
            initializeFavoritesButtons(); // Инициализируем кнопки после входа
        } else {
            currentUserId = null;
            console.log("Пользователь не вошел.");
            disableAllFavoriteButtons(); // Деактивируем кнопки, если пользователь не вошел
        }
    });

    // === Основной функционал плеера ===
    const musicContainers = document.querySelectorAll('.music-container');

    // Функция для форматирования времени (секунды в MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Перебираем каждый музыкальный контейнер
    musicContainers.forEach(container => {
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const progressBar = container.querySelector('.custom-progress-bar');
        const currentTimeSpan = container.querySelector('.current-time');
        const totalDurationSpan = container.querySelector('.total-duration');
        const audio = container.querySelector('audio'); // Находим аудио-элемент внутри текущего контейнера
        const yandexIframe = container.querySelector('.yandex-iframe-hidden'); // Находим iframe Яндекса
        const nexusPlayerTitle = container.querySelector('.nexus-player-title'); // Находим Nexus music заголовок

        let isPlaying = false; // Состояние воспроизведения для текущего плеера

        // Инициализация длительности, как только аудио загрузится
        // Важно: loadedmetadata может не сработать, если аудио уже в кэше.
        // Можно также получить длительность из dataset, если она всегда есть.
        const songDurationStr = container.dataset.duration; // "1:20", "2:30"
        const [minutes, seconds] = songDurationStr.split(':').map(Number);
        const initialTotalDuration = (minutes * 60) + seconds;

        totalDurationSpan.textContent = songDurationStr;
        progressBar.max = initialTotalDuration; // Устанавливаем max значение для прогресс-бара, используя данные из HTML

        // Если аудио уже загружено к моменту DOMContentLoaded (например, из кэша)
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or greater
            progressBar.max = audio.duration;
            totalDurationSpan.textContent = formatTime(audio.duration);
        } else {
            audio.addEventListener('loadedmetadata', () => {
                progressBar.max = audio.duration;
                totalDurationSpan.textContent = formatTime(audio.duration);
            });
        }
        
        // Обработчик кнопки Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                playPauseBtn.textContent = '▶';
                // Скрываем iframe Яндекса и показываем заголовок Nexus music при паузе
                yandexIframe.style.display = 'none';
                nexusPlayerTitle.style.display = 'block'; 
            } else {
                // Останавливаем все другие аудио, если они играют
                document.querySelectorAll('audio').forEach(otherAudio => {
                    if (otherAudio !== audio && !otherAudio.paused) {
                        otherAudio.pause();
                        const otherContainer = otherAudio.closest('.music-container');
                        if (otherContainer) {
                            const otherPlayPauseBtn = otherContainer.querySelector('.play-pause-btn');
                            const otherYandexIframe = otherContainer.querySelector('.yandex-iframe-hidden');
                            const otherNexusPlayerTitle = otherContainer.querySelector('.nexus-player-title');
                            
                            otherPlayPauseBtn.textContent = '▶';
                            otherYandexIframe.style.display = 'none';
                            otherNexusPlayerTitle.style.display = 'block';
                            // Обновляем состояние isPlaying для других плееров
                            // (можно было бы хранить его в data-атрибуте или Map)
                            // Для простоты, здесь просто предполагаем, что если оно на паузе, то isPlaying = false
                        }
                    }
                });

                audio.play();
                playPauseBtn.textContent = '⏸';
                // Показываем iframe Яндекса и скрываем заголовок Nexus music при воспроизведении
                yandexIframe.style.display = 'block';
                nexusPlayerTitle.style.display = 'none'; 
            }
            isPlaying = !isPlaying; // Обновляем состояние
        });

        // Обновление прогресс-бара и текущего времени при воспроизведении
        audio.addEventListener('timeupdate', () => {
            progressBar.value = audio.currentTime;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        });

        // Перемотка при изменении ползунка
        progressBar.addEventListener('input', () => {
            audio.currentTime = progressBar.value;
        });

        // Сброс состояния плеера по окончании воспроизведения
        audio.addEventListener('ended', () => {
            playPauseBtn.textContent = '▶';
            isPlaying = false;
            progressBar.value = 0;
            currentTimeSpan.textContent = '0:00';
            // Скрываем iframe Яндекса и показываем заголовок Nexus music по окончании
            yandexIframe.style.display = 'none';
            nexusPlayerTitle.style.display = 'block';
        });
    });

    // Инициализация кнопок избранного при первой загрузке (если пользователь уже залогинен)
    if (auth.currentUser) {
        currentUserId = auth.currentUser.uid;
        initializeFavoritesButtons();
    } else {
        // Если пользователь не залогинен сразу, onAuthStateChanged обработает это
        disableAllFavoriteButtons();
    }
});