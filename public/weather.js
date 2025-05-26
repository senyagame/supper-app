const API_KEY = "8176cdd345a6be81bb9361a182580d03";

// Функция для установки класса погоды на body
function setWeatherClass(condition) {
    const weatherPageBody = document.body; // Получаем ссылку на body напрямую

    // Удаляем все предыдущие классы погоды с body
    weatherPageBody.classList.remove(
        'weather-clear', 'weather-rain', 'weather-snow',
        'weather-clouds', 'weather-thunderstorm', 'weather-mist',
        'weather-unknown' // Важно удалять и этот класс перед добавлением нового
    );

    // Добавляем новый класс в зависимости от условия
    weatherPageBody.classList.add(`weather-${condition}`);
}


// Функция для получения и отображения погоды
function getWeather(lat, lon) {
    const cityNameElement = document.getElementById("city-name");
    const temperatureElement = document.getElementById("temperature");
    const feelsLikeElement = document.getElementById("feels-like");
    const descriptionElement = document.getElementById("description");

    // URL для запроса погоды
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=ru`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const { name, main, weather } = data;
                cityNameElement.textContent = name;
                temperatureElement.textContent = `${Math.round(main.temp)}°C`;
                feelsLikeElement.textContent = `По ощущениям: ${Math.round(main.feels_like)}°C`;
                descriptionElement.textContent = weather[0].description;

                // Определяем класс погоды
                const weatherCondition = weather[0].main.toLowerCase(); // Приводим к нижнему регистру для сравнения
                let weatherTypeToAdd = 'unknown'; // По умолчанию - неизвестно

                switch (weatherCondition) {
                    case 'clear':
                        weatherTypeToAdd = 'clear';
                        break;
                    case 'rain':
                    case 'drizzle':
                        weatherTypeToAdd = 'rain';
                        break;
                    case 'thunderstorm':
                        weatherTypeToAdd = 'thunderstorm';
                        break;
                    case 'snow':
                        weatherTypeToAdd = 'snow';
                        break;
                    case 'clouds':
                        weatherTypeToAdd = 'clouds';
                        break;
                    case 'mist':
                    case 'fog':
                    case 'haze':
                    case 'smoke':
                    case 'dust':
                    case 'sand':
                    case 'ash':
                    case 'squall':
                    case 'tornado':
                        weatherTypeToAdd = 'mist';
                        break;
                    // Если сюда попадает что-то, чего нет в CSS, останется 'unknown'
                }
                setWeatherClass(weatherTypeToAdd);

            } else {
                cityNameElement.textContent = "Ошибка";
                temperatureElement.textContent = "";
                feelsLikeElement.textContent = "";
                descriptionElement.textContent = data.message || "Не удалось получить данные о погоде.";
                setWeatherClass('unknown'); // В случае ошибки API - установить неизвестную погоду
            }
        })
        .catch((error) => {
            console.error("Ошибка при получении данных о погоде:", error);
            cityNameElement.textContent = "Ошибка сети";
            temperatureElement.textContent = "";
            feelsLikeElement.textContent = "";
            descriptionElement.textContent = "Проверьте ваше интернет-соединение.";
            setWeatherClass('unknown'); // В случае ошибки сети - установить неизвестную погоду
        });
}

// Запрос геолокации пользователя
function fetchLocation() {
    const cityNameElement = document.getElementById("city-name"); // Используем cityNameElement для вывода сообщений
    const temperatureElement = document.getElementById("temperature");
    const feelsLikeElement = document.getElementById("feels-like");
    const descriptionElement = document.getElementById("description");

    if ("geolocation" in navigator) {
        cityNameElement.textContent = "Определение местоположения...";
        temperatureElement.textContent = "";
        feelsLikeElement.textContent = "";
        descriptionElement.textContent = "";
        setWeatherClass('unknown'); // Устанавливаем unknown при старте определения геолокации

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeather(latitude, longitude);
            },
            (error) => {
                console.error("Ошибка при получении местоположения:", error.message);
                cityNameElement.textContent = "Геолокация недоступна";
                descriptionElement.textContent = "Разрешите доступ к местоположению для получения погоды.";
                temperatureElement.textContent = "";
                feelsLikeElement.textContent = "";
                setWeatherClass('unknown'); // Если геолокация недоступна - установить неизвестную погоду
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        cityNameElement.textContent = "Ошибка";
        descriptionElement.textContent = "Геолокация не поддерживается вашим браузером.";
        temperatureElement.textContent = "";
        feelsLikeElement.textContent = "";
        setWeatherClass('unknown'); // Если геолокация не поддерживается - установить неизвестную погоду
    }
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", fetchLocation);