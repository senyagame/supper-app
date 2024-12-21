from flask import Flask, request
from telegram import Bot, Update
from telegram.ext import Dispatcher, CommandHandler, MessageHandler, Filters
import os

# Вставьте ваш Telegram API ключ
TELEGRAM_API_KEY = "8025668147:AAEUhTJMpttbU1Utc8wpfJPWW9geEMv_DTc"

app = Flask(__name__)
bot = Bot(token=TELEGRAM_API_KEY)

# Установка webhook
WEBHOOK_URL = "https://supper-app-two.vercel.app/weather-app.html"  # Укажите ваш домен/адрес сервера


@app.route('/')
def index():
    return "Bot is running!"


@app.route('/webhook', methods=['POST'])
def webhook():
    if request.method == "POST":
        update = Update.de_json(request.get_json(force=True), bot)
        dispatcher.process_update(update)
    return "OK", 200


# Создание обработчиков
def start(update, context):
    user = update.effective_user
    update.message.reply_text(f"Привет, {user.first_name}! Добро пожаловать в Super App.")


def unknown(update, context):
    update.message.reply_text("Извините, я не знаю такую команду.")


def handle_message(update, context):
    text = update.message.text.lower()
    if "погода" in text:
        update.message.reply_text("Перейдите в Weather App через кнопку в меню.")
    elif "музыка" in text:
        update.message.reply_text("Перейдите в Music App через кнопку в меню.")
    else:
        update.message.reply_text("Я могу помочь с погодой или музыкой! Напишите команду или выберите в меню.")


# Инициализация Dispatcher
dispatcher = Dispatcher(bot, None, use_context=True)
dispatcher.add_handler(CommandHandler("start", start))
dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))
dispatcher.add_handler(MessageHandler(Filters.command, unknown))


# Настройка Webhook
if __name__ == '__main__':
    bot.set_webhook(WEBHOOK_URL)
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
