document.addEventListener("DOMContentLoaded", function() {
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");

    headerText.addEventListener("animationend", function() {
        newsText.style.display = "block";
        newsText.style.animationPlayState = "running";
    });

    newsText.addEventListener("animationend", function() {
        comingSoonText.style.display = "block";
        comingSoonText.style.animationPlayState = "running";
    });
});
