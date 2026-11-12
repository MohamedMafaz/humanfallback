
# Api Agent Match Response

## Structure

`ApiAgentMatchResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `matches` | [`ProviderMatch[] \| undefined`](../../doc/models/provider-match.md) | Optional | - |

## Example

```ts
import { ApiAgentMatchResponse } from 'humanfallback-apilib';

const apiAgentMatchResponse: ApiAgentMatchResponse = {
  matches: [
    {
      providerId: 'providerId6',
      score: 100,
      distanceKm: 78.16,
      etaMins: 56,
      price: 255.6,
    }
  ],
};
```

