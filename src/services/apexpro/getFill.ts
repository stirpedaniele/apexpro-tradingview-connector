import ApexproConnector from './client';
import { _sleep } from '../../helper';

export const getFill = async (order_id: string) => {
    let count = 0;
    const maxTries = 3;
    while (count <= maxTries) {
        try {
            const connector = await ApexproConnector.build();
            const orderResponse = await connector.client.privateApi.getOrder(order_id);
            return orderResponse

        } catch (error) {
            count++;
            if (count == maxTries) {
                console.error(error);
            }
            await _sleep(5000);
        }
    }
};
