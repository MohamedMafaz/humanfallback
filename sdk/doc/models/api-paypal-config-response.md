
# Api Paypal Config Response

## Structure

`ApiPaypalConfigResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `mode` | [`ModeEnum \| undefined`](../../doc/models/mode-enum.md) | Optional | - |
| `configured` | `boolean \| undefined` | Optional | - |
| `clientId` | `string \| null \| undefined` | Optional | - |
| `currency` | `string \| undefined` | Optional | - |

## Example

```ts
import { ApiPaypalConfigResponse, ModeEnum } from 'humanfallback-apilib';

const apiPaypalConfigResponse: ApiPaypalConfigResponse = {
  mode: ModeEnum.Paypal,
  configured: false,
  clientId: 'clientId6',
  currency: 'currency2',
};
```

