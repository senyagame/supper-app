document.addEventListener("DOMContentLoaded", function () {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1900);
    }
});

// Функция для навигации между страницами
function navigateTo(page) {
    window.location.href = page;
}

// Функция для открытия модального окна
function openModal() {
    document.getElementById("modal").style.display = "block";
}

// Функция для закрытия модального окна
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Закрытие модального окна при клике вне его
window.onclick = function (event) {
    if (event.target == document.getElementById("modal")) {
        closeModal();
    }
};

// Функция для копирования почты в буфер обмена
function copyEmail() {
    const email = "senyaentertainment@yandex.ru";
    navigator.clipboard.writeText(email).then(() => {
        showNotification("Почта скопирована!");
    }).catch((err) => {
        console.error("Не удалось скопировать почту:", err);
    });
}

// Функция для отображения уведомления
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";

    // Скрыть уведомление через 2 секунды
    setTimeout(() => {
        notification.style.display = "none";
    }, 2000);
}
