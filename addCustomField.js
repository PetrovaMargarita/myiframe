const express = require('express');
const bodyParser = require('body-parser');
const pipedrive = require('pipedrive');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка API Pipedrive
const defaultClient = new pipedrive.ApiClient();
defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

// Экземпляр API для полей сделок
const dealFieldsApi = new pipedrive.DealFieldsApi(defaultClient);

// Маршрут для обработки отправки формы
app.post('/add-custom-deal-fields', async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        // Создание новых пользовательских полей сделки
        const responseFirstName = await dealFieldsApi.addDealField({
            name: 'First Name',
            field_type: 'text',
        });

        const responseLastName = await dealFieldsApi.addDealField({
            name: 'Last Name',
            field_type: 'text',
        });

        // Предположим, что у нас есть существующий ID сделки
        const dealId = 1; // Замените на ваш фактический ID сделки

        // Обновление существующей сделки значениями пользовательских полей
        const updateDealResponse = await dealFieldsApi.updateDeal({
            id: dealId,
            body: {
                [responseFirstName.data.key]: firstName,
                [responseLastName.data.key]: lastName,
            },
        });

        res.status(200).json(updateDealResponse);
    } catch (error) {
        console.error('Ошибка при добавлении пользовательских полей:', error);
        res.status(500).json({ error: 'Не удалось добавить пользовательские поля' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
