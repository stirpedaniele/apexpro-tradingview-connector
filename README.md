# ApeX Pro TradingView Connector

## 1) Connect your wallet to
https://pro.apex.exchange/trade/BTCUSD

## 2) Inspect the ApeX Pro website and populate the .env file values

```
ETH_ADDRESS=
STARK_PUBLIC_KEY=
STARK_PRIVATE_KEY=
API_KEY=
API_PASSPHRASE=
API_SECRET=
ACCOUNT_ID=
```

## 3) Create a new Web Service in Cloud

Web service requirements:
- Runtime Docker
- Add your secret file .env
- Add a minimal Disk
- Mount Path `/app/data`

Build and deploy from this Git repository
https://github.com/stirpedaniele/apexpro-tradingview-connector

## 4) Test the Webhook URL in your Browser

```
apexpro account: OK
```

## 5) Set the Webhook URL in TradingView

Webhook Message:

```
{
    "exchange":"apexpro",
    "strategy":"Main",
    "market":"BTC-USDC",
    "size":"{{strategy.position_size}}",
    "reverse":true,
    "order":"{{strategy.order.action}}",
    "position":"{{strategy.market_position}}",
    "price":"{{strategy.order.price}}"
}
```
