const userModel=require("../models/userModel");

const walletAmountAdding = async (userId, subTotal) => {
    try {
        // Fetching current user
        const user = await userModel.findById(userId);

        // Calculating new balance
        const currentBalance = user.wallet.balance;
        const amount = parseInt(subTotal);
        const newBalance = currentBalance + amount;

        // Creating new detail
        const newDetail = {
            type: 'refund',
            amount: amount,
            date: new Date(),
            transactionId: Math.floor(100000 + Math.random() * 900000)
        };

        // Updating user with new balance and new detail
        const response = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: { "wallet.balance": newBalance },
                $push: { "wallet.details": newDetail }
            },
            { new: true } // to return the updated document
        );

        return response;
    } catch (error) {
        console.error('Error updating wallet amount:', error);
        throw error;
    }
}
const walletMoneyAdding = async (userId, subTotal) => {
    try {
        // Fetching current user
        const user = await userModel.findById(userId);

        // Calculating new balance
        const currentBalance = user.wallet.balance;
        const amount = parseInt(subTotal);
        const newBalance = currentBalance + amount;

        // Creating new detail
        const newDetail = {
            type: 'credit',
            amount: amount,
            date: new Date(),
            transactionId: Math.floor(100000 + Math.random() * 900000)
        };

        // Updating user with new balance and new detail
        const response = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: { "wallet.balance": newBalance },
                $push: { "wallet.details": newDetail }
            },
            { new: true } // to return the updated document
        );

        return response;
    } catch (error) {
        console.error('Error updating wallet amount:', error);
        throw error;
    }
}
const walletDecreasion = async (user, orderAmount) => {
    try {
        // Fetching current user
        

        // Calculating new balance
        const currentBalance = user.wallet.balance;
        const amount = parseInt(orderAmount);
        const newBalance = currentBalance - amount;

        // Creating new detail
        const newDetail = {
            type: 'debit',
            amount: amount,
            date: new Date(),
            transactionId: Math.floor(100000 + Math.random() * 900000)
        };

        // Updating user with new balance and new detail
        const response = await userModel.findOneAndUpdate(
            { _id: user._id },
            {
                $set: { "wallet.balance": newBalance },
                $push: { "wallet.details": newDetail }
            },
            { new: true } // to return the updated document
        );

        return response;
    } catch (error) {
        console.error('Error updating wallet amount:', error);
        throw error;
    }
}
const referalAmountAdding = async (userId) => {
    try {
        // Fetching current user
        const user = await userModel.findById(userId);
        

        // Calculating new balance
        const currentBalance = user.wallet.balance;
        const amount = parseInt(100);
        const newBalance = currentBalance + amount;

        // Creating new detail
        const newDetail = {
            type: 'referral Bonus',
            amount: amount,
            date: new Date(),
            transactionId: Math.floor(100000 + Math.random() * 900000)
        };

        // Updating user with new balance and new detail
        const response = await userModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: { "wallet.balance": newBalance },
                $push: { "wallet.details": newDetail }
            },
            { new: true } // to return the updated document
        );

        return response;
    } catch (error) {
        console.error('Error updating wallet amount:', error);
        throw error;
    }
}













module.exports={
    walletAmountAdding,
    walletMoneyAdding,
    walletDecreasion,
    referalAmountAdding

}