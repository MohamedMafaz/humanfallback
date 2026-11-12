
# Api Agent Match Request

## Structure

`ApiAgentMatchRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `title` | `string` | Required | - |
| `category` | [`CategoryEnum`](../../doc/models/category-enum.md) | Required | - |
| `location` | `string` | Required | - |
| `budget` | `number` | Required | - |
| `requiredEvidence` | `string[] \| undefined` | Optional | - |

## Example

```ts
import { ApiAgentMatchRequest, CategoryEnum } from 'humanfallback-apilib';

const apiAgentMatchRequest: ApiAgentMatchRequest = {
  title: 'title0',
  category: CategoryEnum.PhysicalInspection,
  location: 'location8',
  budget: 32.14,
  requiredEvidence: [
    'requiredEvidence0',
    'requiredEvidence1',
    'requiredEvidence2'
  ],
};
```

