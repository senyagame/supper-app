// music.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// --- Функция для форматирования времени (секунды в MM:SS) ---
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// --- Функция для инициализации одного кастомного плеера ---
export function initializeCustomPlayer(container) {
    const playPauseBtn = container.querySelector('.play-pause-btn');
    const progressBar = container.querySelector('.custom-progress-bar');
    const currentTimeSpan = container.querySelector('.current-time');
    const totalDurationSpan = container.querySelector('.total-duration');
    const audio = container.querySelector('audio');
    const nexusPlayerTitle = container.querySelector('.nexus-player-title');
    const favoriteHeartBtn = container.querySelector('.favorite-heart-btn'); // НАШЕ СЕРДЕЧКО

    let isPlaying = false;

    // Инициализация длительности
    const songDurationStr = container.dataset.duration;
    if (songDurationStr) {
        const [minutes, seconds] = songDurationStr.split(':').map(Number);
        const initialTotalDuration = (minutes * 60) + seconds;
        if (totalDurationSpan) {
            totalDurationSpan.textContent = songDurationStr;
        }
        if (progressBar) {
            progressBar.max = initialTotalDuration;
        }
    } else {
        if (totalDurationSpan) {
            totalDurationSpan.textContent = '0:00';
        }
    }

    if (audio) {
        if (audio.readyState >= 2) {
            if (progressBar) progressBar.max = audio.duration;
            if (totalDurationSpan) totalDurationSpan.textContent = formatTime(audio.duration);
        } else {
            audio.addEventListener('loadedmetadata', () => {
                if (progressBar) progressBar.max = audio.duration;
                if (totalDurationSpan) totalDurationSpan.textContent = formatTime(audio.duration);
            });
        }
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (isPlaying) {
                    audio.pause();
                    playPauseBtn.textContent = '▶';
                    if (nexusPlayerTitle) nexusPlayerTitle.style.display = 'block';
                } else {
                    document.querySelectorAll('audio').forEach(otherAudio => {
                        if (otherAudio !== audio && !otherAudio.paused) {
                            otherAudio.pause();
                            const otherContainer = otherAudio.closest('.music-container');
                            if (otherContainer) {
                                const otherPlayPauseBtn = otherContainer.querySelector('.play-pause-btn');
                                const otherNexusPlayerTitle = otherContainer.querySelector('.nexus-player-title');
                                
                                if (otherPlayPauseBtn) otherPlayPauseBtn.textContent = '▶';
                                if (otherNexusPlayerTitle) otherNexusPlayerTitle.style.display = 'block';
                            }
                        }
                    });

                    audio.play();
                    playPauseBtn.textContent = '⏸';
                    if (nexusPlayerTitle) nexusPlayerTitle.style.display = 'none';
                }
                isPlaying = !isPlaying;
            });
        }

        audio.addEventListener('timeupdate', () => {
            if (progressBar) progressBar.value = audio.currentTime;
            if (currentTimeSpan) currentTimeSpan.textContent = formatTime(audio.currentTime);
        });

        if (progressBar) {
            progressBar.addEventListener('input', () => {
                audio.currentTime = progressBar.value;
            });
        }

        audio.addEventListener('ended', () => {
            if (playPauseBtn) playPauseBtn.textContent = '▶';
            isPlaying = false;
            if (progressBar) progressBar.value = 0;
            if (currentTimeSpan) currentTimeSpan.textContent = '0:00';
            if (nexusPlayerTitle) nexusPlayerTitle.style.display = 'block';
        });
    } else {
        console.warn('Audio element not found or invalid in container:', container);
        if (playPauseBtn) {
            playPauseBtn.textContent = '⛔';
            playPauseBtn.disabled = true;
            playPauseBtn.title = 'Локальный аудиофайл не найден';
        }
        if (progressBar) progressBar.style.display = 'none';
        if (currentTimeSpan) currentTimeSpan.style.display = 'none';
        if (totalDurationSpan) totalDurationSpan.style.display = 'none';
    }
}

// --- Основной обработчик DOMContentLoaded для music.js ---
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

    // --- Функции для управления кнопками избранного (теперь сердечком) ---

    // Обновленная функция для проверки состояния сердечка
    async function updateFavoriteHeartState(heartButton, songData) {
        if (!currentUserId) {
            heartButton.textContent = '🔒'; // Замок, если не залогинен
            heartButton.disabled = true;
            heartButton.title = 'Войдите для добавления в избранное';
            heartButton.classList.remove("is-favorite");
            return;
        }
        
        heartButton.disabled = false; // Разрешаем кнопку, если пользователь залогинен
        heartButton.title = 'Добавить в избранное';

        const userFavoritesRef = doc(db, "favorites", currentUserId);
        try {
            const docSnap = await getDoc(userFavoritesRef);
            if (docSnap.exists()) {
                const favorites = docSnap.data().tracks || [];
                // Улучшенная проверка на уникальность трека: по song, artist, и yandexLink
                const isFavorite = favorites.some(fav =>
                    fav.song === songData.song &&
                    fav.artist === songData.artist &&
                    fav.yandexLink === songData.yandexLink
                );
                if (isFavorite) {
                    heartButton.textContent = '❤️'; // Красное сердечко
                    heartButton.classList.add("is-favorite");
                    heartButton.title = 'Удалить из избранного';
                } else {
                    heartButton.textContent = '🤍'; // Белое сердечко
                    heartButton.classList.remove("is-favorite");
                    heartButton.title = 'Добавить в избранное';
                }
            } else {
                heartButton.textContent = '🤍'; // Белое сердечко
                heartButton.classList.remove("is-favorite");
                heartButton.title = 'Добавить в избранное';
            }
        } catch (error) {
            console.error("Ошибка при проверке избранного:", error);
            heartButton.textContent = '❓'; // Знак вопроса в случае ошибки
            heartButton.disabled = true;
            heartButton.title = 'Ошибка загрузки избранного';
        }
    }

    async function toggleFavorite(heartButton, songData) {
        if (!currentUserId) {
            alert("Пожалуйста, войдите в систему, чтобы добавлять треки в избранное.");
            return;
        }

        const userFavoritesRef = doc(db, "favorites", currentUserId);
        try {
            const docSnap = await getDoc(userFavoritesRef);
            let favorites = docSnap.exists() ? docSnap.data().tracks || [] : [];
            
            const isFavorite = favorites.some(fav =>
                fav.song === songData.song &&
                fav.artist === songData.artist &&
                fav.yandexLink === songData.yandexLink
            );

            if (isFavorite) {
                // Удаляем из избранного
                await updateDoc(userFavoritesRef, {
                    tracks: arrayRemove(songData)
                });
                alert(`${songData.song} удален из понравившихся.`);
            } else {
                // Добавляем в избранное
                if (docSnap.exists()) {
                    await updateDoc(userFavoritesRef, {
                        tracks: arrayUnion(songData)
                    });
                } else {
                    // Если документа пользователя нет, создаем его с первым треком
                    await setDoc(userFavoritesRef, { tracks: [songData] });
                }
                alert(`${songData.song} добавлен в понравившиеся!`);
            }
            // Обновляем состояние сердечка после изменения
            await updateFavoriteHeartState(heartButton, songData);

        } catch (error) {
            console.error("Ошибка при изменении статуса избранного:", error);
            alert("Произошла ошибка при изменении статуса избранного.");
        }
    }

    // --- Инициализация плееров и сердечек на главной странице ---
    const musicContainers = document.querySelectorAll('.music-container');
    musicContainers.forEach(container => {
        initializeCustomPlayer(container); // Инициализируем плеер

        const favoriteHeartBtn = container.querySelector('.favorite-heart-btn');
        if (favoriteHeartBtn) {
            const songData = {
                song: container.dataset.song,
                artist: container.dataset.artist,
                date: container.dataset.date,
                duration: container.dataset.duration,
                img: container.dataset.img,
                yandexLink: container.dataset.yandexLink,
                audioSrc: container.dataset.audioSrc
            };

            // Изначальное состояние сердечка
            // Это будет вызвано после onAuthStateChanged, когда currentUserId будет известен
            // Или если пользователь уже залогинен при первой загрузке.
            // Поэтому напрямую здесь не вызываем, а ждем onAuthStateChanged.

            // Добавляем слушателя событий
            favoriteHeartBtn.addEventListener('click', () => toggleFavorite(favoriteHeartBtn, songData));
        }
    });

    // --- Обработчик состояния авторизации Firebase ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            console.log("Пользователь вошел. UID:", currentUserId);
            // После входа пользователя, обновить состояние всех сердечек
            musicContainers.forEach(async (container) => {
                const favoriteHeartBtn = container.querySelector('.favorite-heart-btn');
                if (favoriteHeartBtn) {
                    const songData = {
                        song: container.dataset.song,
                        artist: container.dataset.artist,
                        yandexLink: container.dataset.yandexLink // Используем для проверки уникальности
                    };
                    await updateFavoriteHeartState(favoriteHeartBtn, songData);
                }
            });
        } else {
            currentUserId = null;
            console.log("Пользователь не вошел.");
            // Если пользователь вышел, сделать все сердечки заблокированными/серыми
            musicContainers.forEach(heartBtn => {
                const favoriteHeartBtn = heartBtn.querySelector('.favorite-heart-btn');
                if (favoriteHeartBtn) {
                    favoriteHeartBtn.textContent = '🔒';
                    favoriteHeartBtn.disabled = true;
                    favoriteHeartBtn.title = 'Войдите для добавления в избранное';
                    favoriteHeartBtn.classList.remove("is-favorite");
                }
            });
        }
    });
});