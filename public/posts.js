document.addEventListener("DOMContentLoaded", function() {
    const headerText = document.getElementById("header-text");
    const newsText = document.getElementById("news-text");
    const comingSoonText = document.getElementById("coming-soon");
    const postForm = document.getElementById("post-form");
    const postContent = document.getElementById("post-content");
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
        const content = postContent.value;
        addPost(content);
        postContent.value = "";
    });

    function addPost(content) {
        const post = document.createElement("div");
        post.className = "post";
        post.textContent = content;
        postsContainer.appendChild(post);
        savePost(content);
    }

    function savePost(content) {
        fetch('/save-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        });
    }

    function loadPosts() {
        fetch('/load-posts')
            .then(response => response.json())
            .then(data => {
                data.forEach(postData => {
                    const post = document.createElement("div");
                    post.className = "post";
                    post.textContent = postData.content;
                    postsContainer.appendChild(post);
                });
            });
    }

    loadPosts();
});