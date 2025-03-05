document.addEventListener("DOMContentLoaded", function () {
    // Функция поиска
    const searchBar = document.getElementById("search-bar");
    const searchResults = document.getElementById("search-results");

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

        document.getElementById("search-feedback").style.display = found ? "none" : "block";
    });

    // Модальное окно
    window.openModal = function () {
        document.getElementById("modal").style.display = "block";
    };

    window.closeModal = function () {
        document.getElementById("modal").style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target === document.getElementById("modal")) {
            closeModal();
        }
    };

    window.copyEmail = function () {
        const email = "senyaentertainment@yandex.ru";
        navigator.clipboard.writeText(email).then(() => {
            alert("Почта скопирована!");
        }).catch((err) => {
            console.error("Ошибка копирования:", err);
        });
    };
});
