const express = require('express');
const authMiddleware = require('../middleware/auth');
const AccountModel = require('../models/account');

const router = express.Router();

class BankDB {
    static _inst_;
    static getInst = () => {
        if ( !BankDB._inst_ ) BankDB._inst_ = new BankDB();
        return BankDB._inst_;
    }

    constructor() { console.log("[Bank-DB] DB Init Completed"); }

    getBalance = async() => {
        if (await AccountModel.findOne().exec()===null){
            const newItem = new AccountModel({});
            const res = await newItem.save();
        }
        const res = await AccountModel.findOne().exec();
        const total = res.total;
        return { success: true, data: total };
    }

    transaction = async ( amount ) => {
        const res = await AccountModel.findOne().exec();
        let total = res.total;
        total += amount;

        const res2 = await AccountModel.findOneAndUpdate({},{total: total});

        return { success: true, data: total};
    }

}

const bankDBInst = BankDB.getInst();

router.post('/getInfo', authMiddleware, async (req, res) => {
    try {
        const { success, data } = await bankDBInst.getBalance();
        if (success) return res.status(200).json({ balance: data });
        else return res.status(500).json({ error: data });
    } catch (e) {
        return res.status(500).json({ error: e });
    }
});

router.post('/transaction', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const { success, data } = await bankDBInst.transaction( parseInt(amount) );
        if (success) res.status(200).json({ success: true, balance: data, msg: "Transaction success" });
        else res.status(500).json({ error: data })
    } catch (e) {
        return res.status(500).json({ error: e });
    }
})

module.exports = router;