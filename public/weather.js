const API_KEY = "8176cdd345a6be81bb9361a182580d03";

// Функция для получения и отображения погоды
function getWeather(lat, lon) {
    const weatherInfo = document.getElementById("weather-info");
    const cityName = document.getElementById("city-name");
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
                cityName.textContent = name;
                temperatureElement.textContent = `${Math.round(main.temp)}°C`;
                feelsLikeElement.textContent = `По ощущениям: ${Math.round(main.feels_like)}°C`;
                descriptionElement.textContent = weather[0].description;

                // Очищаем предыдущие классы
                weatherInfo.className = '';
                weatherInfo.classList.add('weather-info'); // Добавляем основной класс

                // Добавляем класс в зависимости от основной погоды
                if (weather[0].main === 'Clear') {
                    weatherInfo.classList.add('clear');
                } else if (weather[0].main === 'Rain' || weather[0].main === 'Drizzle') {
                    weatherInfo.classList.add('rain');
                } else if (weather[0].main === 'Thunderstorm') {
                    weatherInfo.classList.add('thunderstorm');
                } else if (weather[0].main === 'Snow') {
                    weatherInfo.classList.add('snow');
                } else if (weather[0].main === 'Clouds') {
                    weatherInfo.classList.add('clouds');
                } else if (weather[0].main === 'Mist' || weather[0].main === 'Fog' || weather[0].main === 'Haze') {
                    weatherInfo.classList.add('mist');
                }
                // Добавьте условия else if для других погодных условий и соответствующие классы
            } else {
                weatherInfo.textContent = "Не удалось получить данные о погоде.";
            }
        })
        .catch(() => {
            weatherInfo.textContent = "Ошибка при получении данных о погоде.";
        });
}

// Запрос геолокации пользователя
function fetchLocation() {
    const weatherInfo = document.getElementById("weather-info");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeather(latitude, longitude);
            },
            (error) => {
                console.error("Ошибка при получении местоположения:", error.message);
                weatherInfo.textContent = "Доступ к местоположению запрещен. Невозможно получить данные о погоде.";
            }
        );
    } else {
        weatherInfo.textContent = "Геолокация не поддерживается вашим браузером.";
    }
}

// Инициализация
document.addEventListener("DOMContentLoaded", fetchLocation);