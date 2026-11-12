
# Task Draft

## Structure

`TaskDraft`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `humanRequired` | `boolean \| undefined` | Optional | - |
| `title` | `string` | Required | - |
| `description` | `string \| undefined` | Optional | - |
| `category` | [`CategoryEnum`](../../doc/models/category-enum.md) | Required | - |
| `location` | `string` | Required | - |
| `budget` | `number` | Required | - |
| `priority` | [`PriorityEnum \| undefined`](../../doc/models/priority-enum.md) | Optional | - |
| `instructions` | `string \| undefined` | Optional | - |
| `completionCriteria` | `string[] \| undefined` | Optional | - |
| `requiredEvidence` | `string[] \| undefined` | Optional | - |
| `summary` | `string \| undefined` | Optional | - |
| `confidence` | `number \| undefined` | Optional | **Constraints**: `>= 0`, `<= 1` |
| `missing` | `string[] \| undefined` | Optional | - |
| `model` | `string \| undefined` | Optional | - |
| `source` | [`SourceEnum \| undefined`](../../doc/models/source-enum.md) | Optional | - |

## Example

```ts
import { CategoryEnum, PriorityEnum, TaskDraft } from 'humanfallback-apilib';

const taskDraft: TaskDraft = {
  title: 'title2',
  category: CategoryEnum.DocumentCollection,
  location: 'location6',
  budget: 41.52,
  humanRequired: false,
  description: 'description8',
  priority: PriorityEnum.Low,
  instructions: 'instructions0',
  completionCriteria: [
    'completionCriteria8'
  ],
};
```

