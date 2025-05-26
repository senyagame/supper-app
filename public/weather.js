const API_KEY = "8176cdd345a6be81bb9361a182580d03";

// Функция для получения и отображения погоды
function getWeather(lat, lon) {
    const weatherPageBody = document.getElementById("weather-page-body");
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

                // Удаляем все предыдущие классы погоды с body
                weatherPageBody.classList.remove(
                    'weather-clear', 'weather-rain', 'weather-snow',
                    'weather-clouds', 'weather-thunderstorm', 'weather-mist'
                );

                // Добавляем новый класс в зависимости от основной погоды
                const weatherCondition = weather[0].main.toLowerCase(); // Приводим к нижнему регистру для сравнения
                switch (weatherCondition) {
                    case 'clear':
                        weatherPageBody.classList.add('weather-clear');
                        break;
                    case 'rain':
                    case 'drizzle': // Добавляем Drizzle к дождю
                        weatherPageBody.classList.add('weather-rain');
                        break;
                    case 'thunderstorm':
                        weatherPageBody.classList.add('weather-thunderstorm');
                        break;
                    case 'snow':
                        weatherPageBody.classList.add('weather-snow');
                        break;
                    case 'clouds':
                        weatherPageBody.classList.add('weather-clouds');
                        break;
                    case 'mist':
                    case 'fog':
                    case 'haze':
                    case 'smoke': // Добавляем другие схожие условия к туману
                    case 'dust':
                    case 'sand':
                    case 'ash':
                    case 'squall':
                    case 'tornado':
                        weatherPageBody.classList.add('weather-mist');
                        break;
                    default:
                        // Если тип погоды неизвестен, устанавливаем класс для облачной погоды по умолчанию
                        weatherPageBody.classList.add('weather-clouds');
                        break;
                }

            } else {
                cityNameElement.textContent = "Ошибка";
                temperatureElement.textContent = "";
                feelsLikeElement.textContent = "";
                descriptionElement.textContent = data.message || "Не удалось получить данные о погоде.";
                // В случае ошибки, можно установить класс по умолчанию
                weatherPageBody.classList.remove(
                    'weather-clear', 'weather-rain', 'weather-snow',
                    'weather-clouds', 'weather-thunderstorm', 'weather-mist'
                );
                weatherPageBody.classList.add('weather-clouds'); // Например, серый фон
            }
        })
        .catch((error) => {
            console.error("Ошибка при получении данных о погоде:", error);
            cityNameElement.textContent = "Ошибка сети";
            temperatureElement.textContent = "";
            feelsLikeElement.textContent = "";
            descriptionElement.textContent = "Проверьте ваше интернет-соединение.";
            // В случае ошибки сети, можно установить класс по умолчанию
            weatherPageBody.classList.remove(
                'weather-clear', 'weather-rain', 'weather-snow',
                'weather-clouds', 'weather-thunderstorm', 'weather-mist'
            );
            weatherPageBody.classList.add('weather-clouds'); // Например, серый фон
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
                // Установить класс по умолчанию для body
                document.getElementById("weather-page-body").classList.remove(
                    'weather-clear', 'weather-rain', 'weather-snow',
                    'weather-clouds', 'weather-thunderstorm', 'weather-mist'
                );
                document.getElementById("weather-page-body").classList.add('weather-clouds');
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
        // Установить класс по умолчанию для body
        document.getElementById("weather-page-body").classList.remove(
            'weather-clear', 'weather-rain', 'weather-snow',
            'weather-clouds', 'weather-thunderstorm', 'weather-mist'
        );
        document.getElementById("weather-page-body").classList.add('weather-clouds');
    }
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", fetchLocation);