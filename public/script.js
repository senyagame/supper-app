document.addEventListener("DOMContentLoaded", function () {
    // Функция поиска
    const searchBar = document.getElementById("search-bar");
    const searchResults = document.getElementById("search-results");
    const searchFeedback = document.getElementById("search-feedback"); // Получаем элемент для обратной связи

    if (searchBar) {
        searchBar.addEventListener("input", function () {
            const query = this.value.toLowerCase();
            const tracks = document.querySelectorAll(".music-container");

            searchResults.innerHTML = "";
            let found = false;

            tracks.forEach((track) => {
                const songTitle = track.dataset.song.toLowerCase();
                if (songTitle.includes(query)) {
                    found = true;
                    const resultItem = document.createElement("p");
                    resultItem.textContent = track.querySelector(".song-title").textContent;
                    resultItem.addEventListener("click", () => {
                        track.scrollIntoView({ behavior: "smooth" });
                    });
                    searchResults.appendChild(resultItem);
                }
            });

            if (searchFeedback) {
                searchFeedback.style.display = found ? "none" : "block";
            } else {
                console.error("Элемент 'search-feedback' не найден.");
            }
        });
    } else {
        console.error("Элемент 'search-bar' не найден.");
    }

    window.copyEmail = function () {
        const email = "senyaentertainment@yandex.ru";
        navigator.clipboard.writeText(email).then(() => {
            alert("Почта скопирована!");
        }).catch((err) => {
            console.error("Ошибка копирования:", err);
        });
    };
});