
# Api Stats Response

## Structure

`ApiStatsResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `stats` | `unknown \| undefined` | Optional | - |
| `byCategory` | [`ByCategory[] \| undefined`](../../doc/models/by-category.md) | Optional | - |
| `paypal` | [`Paypal \| undefined`](../../doc/models/paypal.md) | Optional | - |
| `ai` | [`Ai \| undefined`](../../doc/models/ai.md) | Optional | - |

## Example

```ts
import { ApiStatsResponse } from 'humanfallback-apilib';

const apiStatsResponse: ApiStatsResponse = {
  stats: { 'key1': 'val1', 'key2': 'val2' },
  byCategory: [
    {
      category: 'category2',
      count: 234,
    },
    {
      category: 'category2',
      count: 234,
    },
    {
      category: 'category2',
      count: 234,
    }
  ],
  paypal: {
    mode: 'mode0',
    configured: false,
  },
  ai: {
    configured: false,
    textModel: 'textModel0',
    visionModel: 'visionModel6',
  },
};
```

