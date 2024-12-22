const API_URL = "http://localhost:3000"; // Адрес сервера API

document.addEventListener("DOMContentLoaded", function () {
  const headerText = document.getElementById("header-text");
  const newsText = document.getElementById("news-text");
  const comingSoonText = document.getElementById("coming-soon");
  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("posts-container");

  headerText.addEventListener("animationend", function () {
    newsText.style.display = "block";
    newsText.style.animationPlayState = "running";
  });

  newsText.addEventListener("animationend", function () {
    comingSoonText.style.display = "block";
    comingSoonText.style.animationPlayState = "running";
  });

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const nickname = document.getElementById("nickname").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    addPost({ nickname, title, description });
    closePostModal();
  });

  function addPost(post) {
    fetch(`${API_URL}/save-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post),
    })
    .then((response) => {
      if (!response.ok) throw new Error("Ошибка при сохранении поста");
      return response.text();
    })
    .then((data) => {
      console.log(data);
      displayPost(post);
    })
    .catch((error) => console.error("Ошибка:", error));
  }

  // Обновленная функция для отображения постов
  function displayPost(post) {
    const postsContainer = document.getElementById("posts-container");
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
      <img src="./assets/user-icon.png" alt="Home" class="user-icon">
      <div class="nickname">Никнейм: ${post.nickname}</div>
      <div class="title">Тема: ${post.title}</div>
      <div class="description">${post.description}</div>
    `;
    postsContainer.appendChild(postElement);
  }

  // Загружаем посты при загрузке страницы
  document.addEventListener("DOMContentLoaded", loadPosts);

  function loadPosts() {
    fetch(`${API_URL}/load-posts`)
    .then((response) => {
      if (!response.ok) throw new Error("Ошибка при загрузке постов");
      return response.json();
    })
    .then((posts) => {
      postsContainer.innerHTML = "";
      posts.forEach((post) => displayPost(post));
    })
    .catch((error) => console.error("Ошибка:", error));
  }

  loadPosts();
});

function openPostModal() {
  document.getElementById("post-modal").style.display = "block";
}

function closePostModal() {
  document.getElementById("post-modal").style.display = "none";
}
