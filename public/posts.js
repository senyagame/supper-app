document.addEventListener("DOMContentLoaded", function() {
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");
    const postForm = document.getElementById("post-form");
    const postsContainer = document.getElementById("posts-container");

    headerText.addEventListener("animationend", function() {
        newsText.style.display = "block";
        newsText.style.animationPlayState = "running";
    });

    newsText.addEventListener("animationend", function() {
        comingSoonText.style.display = "block";
        comingSoonText.style.animationPlayState = "running";
    });

    postForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const nickname = document.getElementById("nickname").value;
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        addPost(nickname, title, description);
        closePostModal();
    });

    function addPost(nickname, title, description) {
        const post = {
            nickname: nickname,
            title: title,
            description: description
        };
        fetch('/save-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            displayPost(post);
        })
        .catch(error => {
            console.error("Ошибка при сохранении поста:", error);
        });
    }

    function displayPost(post) {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
            <div class="nickname">${post.nickname}</div>
            <div class="title">${post.title}</div>
            <div class="description">${post.description}</div>
        `;
        postsContainer.appendChild(postElement);
    }

    function loadPosts() {
        fetch('/load-posts')
            .then(response => response.json())
            .then(data => {
                data.forEach(post => displayPost(post));
            })
            .catch(error => {
                console.error("Ошибка при загрузке постов:", error);
            });
    }

    loadPosts();
});

function openPostModal() {
    document.getElementById("post-modal").style.display = "block";
}

function closePostModal() {
    document.getElementById("post-modal").style.display = "none";
}