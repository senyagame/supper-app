const API_KEY = "8176cdd345a6be81bb9361a182580d03";

// Функция для получения и отображения погоды
function getWeather(lat, lon) {
    const weatherInfo = document.getElementById("weather-info");
    const cityName = document.getElementById("city-name");

    // URL для запроса погоды
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const { name, main, weather } = data;
                cityName.textContent = name;
                weatherInfo.innerHTML = `
                    <p>Температура: ${main.temp}°C</p>
                    <p>По ощущениям как: ${main.feels_like}°C</p>
                    <p>Погода: ${translateWeatherDescription(weather[0].description)}</p>
                `;
            } else {
                weatherInfo.textContent = "Не удалось получить данные о погоде.";
            }
        })
        .catch(() => {
            weatherInfo.textContent = "Ошибка при получении данных о погоде.";
        });
}

// Функция для перевода описания погоды
function translateWeatherDescription(description) {
    const translations = {
        "clear sky": "ясное небо ☀️",
        "few clouds": "малооблачно ☁️",
        "scattered clouds": "облачно ☁️",
        "broken clouds": "облачно с прояснениями ⛅",
        "shower rain": "ливень ⛈️",
        "rain": "дождь 🌧️",
        "thunderstorm": "гроза 🌩️",
        "snow": "снег ❄️",
        "mist": "туман 🌫️",
        "fog": "дымка 🌫️"
    };
    return translations[description] || description;
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
