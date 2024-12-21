import telebot
from telebot import types

API_KEY = '8025668147:AAEUhTJMpttbU1Utc8wpfJPWW9geEMv_DTc'
bot = telebot.TeleBot(API_KEY)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup()
    web_app = types.WebAppInfo("https://supper-app-two.vercel.app/weather-app.html")  # Замени на URL твоего веб-приложения
    button = types.InlineKeyboardButton("Открыть приложение", web_app=web_app)
    markup.add(button)
    bot.send_message(message.chat.id, "Привет! Нажми на кнопку ниже, чтобы открыть приложение:", reply_markup=markup)

bot.polling()
