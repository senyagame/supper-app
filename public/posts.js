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
        const post = document.createElement("div");
        post.className = "post";
        post.innerHTML = `
            <div class="nickname">${nickname}</div>
            <div class="title">${title}</div>
            <div class="description">${description}</div>
        `;
        postsContainer.appendChild(post);
        savePost({ nickname, title, description });
    }

    function savePost(post) {
        fetch('/save-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });
    }

    function loadPosts() {
        fetch('/load-posts')
            .then(response => response.json())
            .then(data => {
                data.forEach(postData => {
                    const post = document.createElement("div");
                    post.className = "post";
                    post.innerHTML = `
                        <div class="nickname">${postData.nickname}</div>
                        <div class="title">${postData.title}</div>
                        <div class="description">${postData.description}</div>
                    `;
                    postsContainer.appendChild(post);
                });
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