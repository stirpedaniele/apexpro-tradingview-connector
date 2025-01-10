import ApexproConnector from './client';
import 'dotenv/config';

export const apexproGetAccount = async () => {
    try {
        const connector = await ApexproConnector.build();
        if(!connector)
            return false

        const balance = await connector.client.privateApi.accountBalance();
        console.log('apexpro balance: ', balance);

        return true

    } catch (error) {
        console.error(error);
    }
};
