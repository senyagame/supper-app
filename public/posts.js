document.addEventListener("DOMContentLoaded", function () {
  const headerText = document.getElementById("header-text");
  const newsText = document.getElementById("news-text");
  const comingSoonText = document.getElementById("coming-soon");
  const postForm = document.getElementById("post-form");
  const postsContainer = document.getElementById("posts-container");

  // Анимация заголовков
  headerText.addEventListener("animationend", function () {
      newsText.style.display = "block";
      newsText.style.animationPlayState = "running";
  });

  newsText.addEventListener("animationend", function () {
      comingSoonText.style.display = "block";
      comingSoonText.style.animationPlayState = "running";
  });

  // Обработка формы добавления поста
  postForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      addPost({ title, description });
      closePostModal();
  });

  // Функция добавления поста
  function addPost(post) {
      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      posts.push(post);
      localStorage.setItem("posts", JSON.stringify(posts));
      displayPost(post);
  }

  // Функция отображения поста
  function displayPost(post) {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
          <div class="title">${post.title}</div>
          <div class="description">${post.description}</div>
          <button class="delete-btn" onclick="confirmDelete('${post.title}')">Удалить</button>
      `;
      postsContainer.appendChild(postElement);
  }

  // Функция подтверждения удаления поста
  window.confirmDelete = function (title) {
      const confirmAction = confirm("Вы уверены, что хотите удалить эту запись? Вы не сможете её восстановить!");
      if (confirmAction) {
          deletePost(title);
      }
  };

  // Функция удаления поста
  function deletePost(title) {
      let posts = JSON.parse(localStorage.getItem("posts")) || [];
      posts = posts.filter(post => post.title !== title);
      localStorage.setItem("posts", JSON.stringify(posts));
      loadPosts();
  }

  // Функция загрузки постов
  function loadPosts() {
      postsContainer.innerHTML = "";
      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      posts.forEach(post => displayPost(post));
  }

  // Открытие и закрытие модального окна
  window.openPostModal = function () {
      document.getElementById("post-modal").style.display = "block";
  };

  window.closePostModal = function () {
      document.getElementById("post-modal").style.display = "none";
  };

  loadPosts();
});
