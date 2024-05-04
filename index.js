const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const link = process.env.LINK_PROJECT;

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Нижу появилась кнопка заполнения формы", {
      reply_markup: {
        keyboard: [[{ text: "Сделать заказ", web_app: { url: link + "/" } }]], //обычная keyboard кнопка
        inline_keyboard: [
          [
            {
              text: "Сделать заказ",
              web_app: { url: link + "/" }, //инлайн кнока находится в самом чате и обязана что то делать
            },
          ],
        ],
        //menu button кнопка находящаяся в самом боте её нужно проинициализировтаь в самом боте
      },
    });
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      await bot.sendMessage(chatId, "Спасибо за обратную связь!");
      await bot.sendMessage(chatId, "Ваша страна:" + data?.country);
      await bot.sendMessage(chatId, "Ваша улица" + data?.city);
      await bot.sendMessage(chatId, "Лицо" + data?.subject);

      setTimeout(async () => {
        await bot.sendMessage(chatId, "Всю информацию вы узнаете в чате");
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log("Server started on PORT" + PORT);
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успешная покупка",
      input_message_content: {
        message_text: "Вы приобрели товары на сумму" + totalPrice,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось приобрести товар",
      input_message_content: {
        message_text: "Не удалось приобрести товар",
      },
    });
    return res.status(500).json({});
  }
});
