document.addEventListener("DOMContentLoaded", function () {
    // Анимация текста в заголовке
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");

    headerText.addEventListener("animationend", function () {
        newsText.style.display = "block";
        newsText.style.animationPlayState = "running";
    });

    newsText.addEventListener("animationend", function () {
        comingSoonText.style.display = "block";
        comingSoonText.style.animationPlayState = "running";
    });

    // Логика работы плееров
    const playButtons = document.querySelectorAll(".play-btn");
    const progressBars = document.querySelectorAll(".progress-bar");

    playButtons.forEach((button) => {
        const audioId = button.dataset.player;
        const plays = document.getElementById(`plays-${audioId}`);
        let playCount = parseInt(localStorage.getItem(`plays-${audioId}`)) || 0;
        plays.textContent = `Прослушиваний: ${playCount}`;

        button.addEventListener("click", function () {
            const audio = document.getElementById(audioId);
            playCount = parseInt(localStorage.getItem(`plays-${audioId}`)) || 0;

            // Если аудио играет — ставим на паузу
            if (!audio.paused) {
                audio.pause();
                this.textContent = "▶";
            } else {
                // Останавливаем все остальные аудиофайлы перед воспроизведением
                document.querySelectorAll("audio").forEach((aud) => aud.pause());
                document.querySelectorAll(".play-btn").forEach((btn) => (btn.textContent = "▶"));

                // Воспроизводим выбранный
                audio.play();
                this.textContent = "❚❚";
                playCount++;
                localStorage.setItem(`plays-${audioId}`, playCount);
                plays.textContent = `Прослушиваний: ${playCount}`;
            }
        });
    });

    progressBars.forEach((progressBar) => {
        const audioId = progressBar.dataset.player;
        const audio = document.getElementById(audioId);
        const durationEl = document.getElementById(`duration-${audioId}`);

        audio.addEventListener("loadedmetadata", () => {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60).toString().padStart(2, "0");
            durationEl.textContent = `Длительность: ${minutes}:${seconds}`;
        });

        // Обновление прогресс-бара в зависимости от времени аудио
        audio.addEventListener("timeupdate", () => {
            progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
        });

        // Изменение времени воспроизведения при перемещении ползунка
        progressBar.addEventListener("input", () => {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        });
    });

    // Логика поиска песен
    const searchBar = document.getElementById("search-bar");
    const searchResults = document.getElementById("search-results");
    const musicContainers = document.querySelectorAll(".music-container");

    searchBar.addEventListener("input", function () {
        const query = searchBar.value.toLowerCase().trim();
        searchResults.innerHTML = ""; // Очищаем старые результаты

        if (query === "") {
            // Если поле пустое, показываем все треки
            musicContainers.forEach((container) => {
                container.style.display = "block";
            });
            searchResults.style.display = "none";
            return;
        }

        // Ищем треки, подходящие под запрос
        let hasResults = false;
        musicContainers.forEach((container) => {
            const songTitle = container.dataset.song.toLowerCase();
            if (songTitle.includes(query)) {
                const resultItem = document.createElement("p");
                resultItem.textContent = container.dataset.song;
                resultItem.classList.add("result-item");

                // Клик по результату — скролл к треку
                resultItem.addEventListener("click", () => {
                    container.scrollIntoView({ behavior: "smooth", block: "center" });
                });

                searchResults.appendChild(resultItem);
                hasResults = true;
            }
        });

        // Показ результатов поиска
        searchResults.style.display = hasResults ? "block" : "none";
    });
});
