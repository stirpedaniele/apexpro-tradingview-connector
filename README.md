# ApeX Pro TradingView Connector

## Connect your wallet to
https://pro.apex.exchange

## Inspect the ApeX Pro website and populate the .env file values

## Create a new web service
https://render.com

## Web service requirements
- Runtime Docker
- Starter subscription
- Add secret file .env
- Disk 1GB
- Mount Path /app/data

## Build and deploy from this Git repository
https://github.com/stirpedaniele/apexpro-tradingview-connector

## Set the Webhook URL in TradingView

## Webhook Message

```
{
    "exchange": "apexpro",
    "strategy":"test",
    "market":"{{ticker}}",
    "size":"{{strategy.market_position_size}}",
    "reverse":true,
    "order":"{{strategy.order.action}}",
    "position":"{{strategy.market_position}}",
    "price":"{{strategy.order.price}}"
}
```
