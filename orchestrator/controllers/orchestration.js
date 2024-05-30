const { json } = require('express');
const jwt = require('jsonwebtoken');
const { sendToQueue, receiveFromQueue } = require('../utils/rabbitmq');

const TransactionController = require('../../transaction-service/controllers/newTransaction');
const UserCredit = require('../../user-service/controllers/updateCredit');

exports.problemIssueSaga = async (req, res) => {
    try {
        await sendToQueue('user-service-credit-req', req.body);
        await receiveFromQueue('user-service-credit-res', async (msg) => {
            const { userId, creditAmount } = JSON.parse(msg.content.toString());
            if (creditAmount <= 0) {
                await sendToQueue('user-service-credit-compensate', req.body);
                return res.status(400).json({ error: 'Insufficient credits' });
            }
            await sendToQueue('problem-issue-service-req', req.body);
            await receiveFromQueue('problem-issue-service-res', async (msg) => {
                const { message } = JSON.parse(msg.content.toString());
                return res.status(200).json({ message });
            });

        });
    }
    catch (error) {
        // Not sure if this the one chief - Fix if necessary
        console.error('Error in problem issue saga:', error);
        res.status(500).json({ error: 'Error in problem issue saga' });
    }
}
/*
exports.addCredit = async (req, res) => {
    try {
        const { userId} = req.body;
        await sendToQueue('user-service-add-credit', req.body);
        return res.status(200).json({ message: 'Credit added successfully' });
    } catch (error) {
        console.error('Error adding credit:', error);
        res.status(500).json({ error: 'Error adding credit' });
    }
}*/

receiveFromQueue('user-service-add-credit-res', async (msg) => {//μπορει να πρεπει να παει μεσα στο addCredit με await
    const { userId, creditAmount } = JSON.parse(msg.content.toString());
    const result = await UserCredit.updateCredit({ body: { userId, credit: creditAmount }});
    
    if (result && result.success) { 
        sendToQueue('transaction-service-log', { userId, amount: creditAmount, type: 'Purchase' });
    }
});

receiveFromQueue('transaction-service-log-res', async (msg) => {//μπορει να πρεπει να παει μεσα στο addCredit με await
    const { userId, amount, type } = JSON.parse(msg.content.toString());
    await TransactionController.createTransaction({ body: { userId, amount, type }});
});

exports.addCredit = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (amount <= 0) return res.status(400).json({ error: 'Invalid credit amount' });

        await sendToQueue('user-service-add-credit', { userId, amount });
        return res.status(200).json({ message: 'Credit add request sent successfully' });
    } catch (error) {
        console.error('Error adding credit:', error);
        res.status(500).json({ error: 'Error adding credit' });
    }
};
