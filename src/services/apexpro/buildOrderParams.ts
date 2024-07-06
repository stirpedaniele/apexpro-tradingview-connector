import ApexproConnector from './client';
import config = require('config');
import { AlertObject } from '../../types';
import 'dotenv/config';
import { getDecimalPointLength, getStrategiesDB } from '../../helper';
import { CreateOrderOptionsObject, generateRandomClientId, OrderType } from "apexpro-connector-node";
import { Market } from "apexpro-connector-node/lib/apexpro/interface";
import { BigNumber } from 'bignumber.js';

export const apexproBuildOrderParams = async (alertMessage: AlertObject) => {
    const [db, rootData] = getStrategiesDB();
    const connector = await ApexproConnector.build();

    let market = alertMessage.market;

    const marketsData = await connector.GetSymbolData(market);
    if (!marketsData) {
        console.log('Market data error, symbol=' + market);
    }
    console.log('Market Data', marketsData);

    const tickerData = await connector.client.publicApi.tickers(marketsData.crossSymbolName);
    console.log('Ticker Data', tickerData);

    if (tickerData.length == 0) {
        console.log('Ticker data is error, symbol=' + marketsData.crossSymbolName);
    }

    const orderSide = alertMessage.order == 'buy' ? "BUY" : "SELL";
    const storedPositionSize = rootData[alertMessage.strategy].position;

    let orderSize: number;

    if (rootData[alertMessage.strategy].isFirstOrder == 'false' && alertMessage.position != 'flat') {
        orderSize = (alertMessage.reverse && storedPositionSize != 0) ? Math.abs(alertMessage.size) * 2 : Math.abs(alertMessage.size);
    }
    else if (rootData[alertMessage.strategy].isFirstOrder == 'false' && alertMessage.position == 'flat') {
        orderSize = Math.abs(storedPositionSize);
    }
    else {
        orderSize = Math.abs(alertMessage.size);
    }

    const rootPath = '/' + alertMessage.strategy;
    const positionPath = rootPath + '/position';
    db.push(positionPath, alertMessage.size);

    console.log('Strategy', rootData[alertMessage.strategy]);

    const stepSize = parseFloat(marketsData.stepSize);
    let orderSizeStr;

    if (stepSize >= 1) {
        orderSizeStr = new BigNumber(orderSize).div(stepSize).dp(0, BigNumber.ROUND_DOWN).multipliedBy(stepSize).toFixed(0, BigNumber.ROUND_DOWN)
    }
    else {
        const stepDecimal = getDecimalPointLength(stepSize);
        orderSizeStr = Number(orderSize).toFixed(stepDecimal);
    }

    const latestPrice = parseFloat(tickerData.at(0).oraclePrice);
    const tickSize = parseFloat(marketsData.tickSize);
    console.log('latestPrice:', latestPrice);

    const slippagePercentage = 0.05;
    const minPrice = orderSide == "BUY"
            ? latestPrice * (1 + slippagePercentage)
            : latestPrice * (1 - slippagePercentage);

    const priceBN = new BigNumber(minPrice);
    const price = priceBN.minus(priceBN.mod(tickSize)).toFixed();

    const fee = parseFloat(config.get('Apexpro.User.limitFee')) * parseFloat(price) * parseFloat(orderSizeStr)
    console.log('fee:', fee.toString());

    const currency_info: any = connector.symbols.currency.find((item) => item.id == marketsData.settleCurrencyId);

    const limitFee = BigNumber(fee).toFixed(currency_info.starkExResolution.length - 1, BigNumber.ROUND_UP)
    console.log('limitFee:', limitFee.toString());

    const apiOrder: CreateOrderOptionsObject = {
        limitFee: limitFee.toString(),
        price: price,
        reduceOnly: false,
        side: orderSide,
        size: orderSizeStr,
        symbol: <Market>market,
        timeInForce: 'FILL_OR_KILL',
        type: OrderType.MARKET,
        clientOrderId: generateRandomClientId(),
        positionId: connector.positionID,
        trailingPercent: '',
        triggerPrice: '',
    };
    console.log('API Order for apexpro:', apiOrder);

    return apiOrder;
};
