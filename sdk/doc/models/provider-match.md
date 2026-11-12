
# Provider Match

## Structure

`ProviderMatch`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `providerId` | `string \| undefined` | Optional | - |
| `score` | `number \| undefined` | Optional | **Constraints**: `>= 0`, `<= 100` |
| `distanceKm` | `number \| undefined` | Optional | - |
| `etaMins` | `number \| undefined` | Optional | - |
| `price` | `number \| undefined` | Optional | - |
| `rationale` | `string \| undefined` | Optional | - |
| `source` | [`SourceEnum \| undefined`](../../doc/models/source-enum.md) | Optional | - |
| `reasons` | [`Reason[] \| undefined`](../../doc/models/reason.md) | Optional | - |

## Example

```ts
import { ProviderMatch } from 'humanfallback-apilib';

const providerMatch: ProviderMatch = {
  providerId: 'providerId2',
  score: 14,
  distanceKm: 130.02,
  etaMins: 122,
  price: 203.74,
};
```

