document.addEventListener("DOMContentLoaded", function () {
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

    // Логика плееров
    const playButtons = document.querySelectorAll(".play-btn");
    const progressBars = document.querySelectorAll(".progress-bar");

    playButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const audioId = this.dataset.player;
            const audio = document.getElementById(audioId);

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
            }
        });
    });

    progressBars.forEach((progressBar) => {
        const audioId = progressBar.dataset.player;
        const audio = document.getElementById(audioId);

        // Обновление прогресс-бара в зависимости от времени аудио
        audio.addEventListener("timeupdate", () => {
            progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
        });

        // Изменение времени воспроизведения при перемещении ползунка
        progressBar.addEventListener("input", () => {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        });
    });
});
