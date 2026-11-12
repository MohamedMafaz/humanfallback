
# Payment

## Structure

`Payment`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `mode` | [`ModeEnum \| undefined`](../../doc/models/mode-enum.md) | Optional | - |
| `status` | [`StatusEnum \| undefined`](../../doc/models/status-enum.md) | Optional | - |
| `orderId` | `string \| null \| undefined` | Optional | - |
| `captureId` | `string \| null \| undefined` | Optional | - |
| `amount` | `number \| undefined` | Optional | - |
| `fee` | `number \| undefined` | Optional | - |
| `total` | `number \| undefined` | Optional | - |
| `currency` | `string \| undefined` | Optional | - |
| `capturedAt` | `string \| null \| undefined` | Optional | - |

## Example

```ts
import { ModeEnum, Payment, StatusEnum } from 'humanfallback-apilib';

const payment: Payment = {
  mode: ModeEnum.Paypal,
  status: StatusEnum.Authorized,
  orderId: 'orderId4',
  captureId: 'captureId2',
  amount: 255.38,
};
```

