
# Api Tasks Request

## Structure

`ApiTasksRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `draft` | [`TaskDraft`](../../doc/models/task-draft.md) | Required | - |
| `providerId` | `string` | Required | - |
| `matches` | [`ProviderMatch[] \| undefined`](../../doc/models/provider-match.md) | Optional | - |

## Example

```ts
import {
  ApiTasksRequest,
  CategoryEnum,
  PriorityEnum,
} from 'humanfallback-apilib';

const apiTasksRequest: ApiTasksRequest = {
  draft: {
    title: 'title2',
    category: CategoryEnum.DocumentCollection,
    location: 'location6',
    budget: 57.12,
    humanRequired: false,
    description: 'description8',
    priority: PriorityEnum.Low,
    instructions: 'instructions0',
    completionCriteria: [
      'completionCriteria8'
    ],
  },
  providerId: 'providerId0',
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

