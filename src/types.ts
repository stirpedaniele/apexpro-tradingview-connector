import { PositionSide } from '@perp/sdk-curie';

export type AlertObject = {
    exchange: string;
    strategy: string;
    market: string;
    size: number;
    reverse: boolean;
    order: string;
    position: string;
    price: number;
};
