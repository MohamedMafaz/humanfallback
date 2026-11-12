
# Api Agent Parse Response

## Structure

`ApiAgentParseResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `draft` | [`TaskDraft \| undefined`](../../doc/models/task-draft.md) | Optional | - |
| `ai` | [`AiMeta \| undefined`](../../doc/models/ai-meta.md) | Optional | - |

## Example

```ts
import {
  ApiAgentParseResponse,
  CategoryEnum,
  PriorityEnum,
} from 'humanfallback-apilib';

const apiAgentParseResponse: ApiAgentParseResponse = {
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
  ai: {
    configured: false,
    model: 'model0',
    totalMs: 214,
  },
};
```

