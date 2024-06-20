const pipedrive = require('pipedrive');
require('dotenv').config();
const defaultClient = new pipedrive.ApiClient();
defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;

module.exports = (req, res) => {
    // Добавление заголовков CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
res.setHeader('Access-Control-Allow-Credentials', true);


    // Если это preflight запрос, просто завершите его
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { firstName, lastName, dealId } = req.body;

    const api = new pipedrive.DealFieldsApi(defaultClient);
    api.addDealField({
        name: 'First Name',
        field_type: 'varchar',
    }).then(firstNameFieldResponse => {
        const firstNameFieldKey = firstNameFieldResponse.data.key;

        return api.addDealField({
            name: 'Last Name',
            field_type: 'varchar',
        }).then(lastNameFieldResponse => {
            const lastNameFieldKey = lastNameFieldResponse.data.key;

            const dealsApi = new pipedrive.DealsApi(defaultClient);
            const updateData = {
                [firstNameFieldKey]: firstName,
                [lastNameFieldKey]: lastName,
            };

            return dealsApi.updateDeal(dealId, updateData);
        });
    }).then(updatedDeal => {
        res.status(200).json({ message: 'Deal updated successfully', data: updatedDeal });
    }).catch(error => {
        res.status(500).json({ message: 'Failed to add or update fields', error });
    });
};
