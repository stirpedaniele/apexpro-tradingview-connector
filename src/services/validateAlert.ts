import { AlertObject } from '../types';
import ApexproConnector from './apexpro/client';
import { getStrategiesDB } from '../helper';

export const validateAlert = async (
    alertMessage: AlertObject
): Promise<boolean> => {
    // check correct alert JSON format
    if (!Object.keys(alertMessage).length) {
        console.error('Tradingview alert is not JSON format');
        return false;
    }

    // check exchange
    if (alertMessage.exchange) {
        const validExchanges = ['apexpro'];
        if (!validExchanges.includes(alertMessage.exchange)) {
            console.error('Exchange name must be apexpro');
            return false;
        }
    }

    // check strategy name
    if (!alertMessage.strategy) {
        console.error('Strategy field of tradingview alert must not be empty');
        return false;
    }

    // check orderSide
    if (alertMessage.order != 'buy' && alertMessage.order != 'sell') {
        console.error('Side field of tradingview alert is not correct. Must be buy or sell');
        return false;
    }

    //check position
    if (
        alertMessage.position != 'long' &&
        alertMessage.position != 'short' &&
        alertMessage.position != 'flat'
    ) {
        console.error('Position field of tradingview alert is not correct');
        return false;
    }

    //check reverse
    if (typeof alertMessage.reverse != 'boolean') {
        console.error('Reverse field of tradingview alert is not correct. Must be true or false');
        return false;
    }

    // check market if exchange is Apexpro
    if (!alertMessage.exchange || alertMessage.exchange == 'apexpro') {
        let market = alertMessage.market;
        if (!market) {
            console.error('Market field of tradingview alert is not correct');
            return false;
        }

        const connector = await ApexproConnector.build();
        const marketsData = await connector.GetSymbolData(market);

        if (!marketsData) {
            console.error('MarketsData field of tradingview alert is not correct');
            return false;
        }

        const minOrderSize = parseFloat(marketsData.minOrderSize);

        // check order size is greater than mininum order size
        if (Math.abs(alertMessage.size) < minOrderSize && alertMessage.position != 'flat') {
            console.error('Order size of this strategy must be greater than mininum order size: ', minOrderSize);
            return false;
        }
    }

    const [db, rootData] = getStrategiesDB();

    const rootPath = '/' + alertMessage.strategy;
    const isFirstOrderPath = rootPath + '/isFirstOrder';

    if (!rootData[alertMessage.strategy]) {
        db.push(isFirstOrderPath, 'true');
        const positionPath = rootPath + '/position';
        db.push(positionPath, alertMessage.size);
    }
    else {
        db.push(isFirstOrderPath, 'false');
    }

    const reversePath = rootPath + '/reverse';
    db.push(reversePath, alertMessage.reverse);

    if (
        alertMessage.position == 'flat' &&
        rootData[alertMessage.strategy].isFirstOrder == 'true'
    ) {
        console.log('This alert is first and close order, so does not create a new order');
        return false;
    }

    return true;
};
