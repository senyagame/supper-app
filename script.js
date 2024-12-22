window.onload = function () {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1900);
};

function navigateTo(page) {
    window.location.href = `/${page}.html`;
}
