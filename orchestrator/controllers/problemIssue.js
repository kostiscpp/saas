const { json } = require('express');
const jwt = require('jsonwebtoken');
const { sendToQueue, receiveFromQueue } = require('../utils/rabbitmq');

const TransactionController = require('../../transaction-service/controllers/newTransaction');
const UserCredit = require('../../user-service/controllers/updateCredit');
const UserRemoval = require('../../user-service/controllers/deleteUser');


exports.problemIssue = async (req, res) => {
    try {
        await sendToQueue('user-service-credit-req', req.body);
        await receiveFromQueue('user-service-credit-res', async (msg) => {
            if (!msg.success) {
               res.status(400).json({ error: 'Insufficient credits' });
            }
        }
        );
        if (!res.status(400)) {
            await sendToQueue('problem-service-issue', req.body);
            res.status(200).json({ message: 'Problem issued successfully' });
        }
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


