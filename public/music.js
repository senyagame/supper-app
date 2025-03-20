import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Функция переключения плееров (первый плеер виден, остальные скрыты)
    document.querySelectorAll(".audio-player").forEach((el, index) => {
        if (index !== 0) el.style.display = "none";
    });
// Функция переключения плееров
    document.getElementById("toggle-players").addEventListener("click", function () {
        document.querySelectorAll("iframe").forEach((el) => el.style.display = "none");
        document.querySelectorAll(".audio-player").forEach((el) => el.style.display = "block");
    });
});