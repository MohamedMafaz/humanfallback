
# Api Tasks Pay Response

## Structure

`ApiTasksPayResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `orderId` | `string \| undefined` | Optional | - |
| `mode` | [`ModeEnum \| undefined`](../../doc/models/mode-enum.md) | Optional | - |
| `approveUrl` | `string \| null \| undefined` | Optional | - |
| `amount` | `number \| undefined` | Optional | - |
| `currency` | `string \| undefined` | Optional | - |
| `taskCode` | `string \| undefined` | Optional | - |

## Example

```ts
import { ApiTasksPayResponse, ModeEnum } from 'humanfallback-apilib';

const apiTasksPayResponse: ApiTasksPayResponse = {
  orderId: 'orderId4',
  mode: ModeEnum.Paypal,
  approveUrl: 'approveUrl2',
  amount: 175.58,
  currency: 'currency6',
};
```

