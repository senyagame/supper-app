window.onload = function () {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 3000);
};

function navigateTo(page) {
    window.location.href = `/${page}.html`;
}
