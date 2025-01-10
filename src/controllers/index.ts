import express, { Router } from 'express';
import {
    apexproGetAccount,
    validateAlert,
    apexproBuildOrderParams,
    apexproCreateOrder,
} from '../services';

const router: Router = express.Router();

router.get('/', async (req, res) => {
    console.log('Recieved GET request');

    const apexproAccount = await apexproGetAccount();

    if (!apexproAccount) {
        res.send('apexpro account: KO');
    } else {
        const message = 'apexpro account: OK';
        res.send(message);
    }
});

router.post('/', async (req, res) => {
    console.log('Recieved Tradingview strategy alert:', req.body);

    const validated = await validateAlert(req.body);
    if (!validated) {
        res.send('alert message is not valid');
        return;
    }

    let orderResult;
    switch (req.body['exchange']) {
        case 'perpetual': {

            break;
        }
        default: {
            try {
                const orderParams = await apexproBuildOrderParams(req.body);
                if (!orderParams) return;
                orderResult = await apexproCreateOrder(orderParams);
                if (!orderResult) return;
            } catch (error) {
                res.send(error);
                return;
            }
        }
    }

    res.send('OK');
});

router.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
});

export default router;
