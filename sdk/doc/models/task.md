
# Task

## Structure

`Task`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string \| undefined` | Optional | - |
| `code` | `string \| undefined` | Optional | - |
| `title` | `string \| undefined` | Optional | - |
| `description` | `string \| undefined` | Optional | - |
| `category` | [`CategoryEnum \| undefined`](../../doc/models/category-enum.md) | Optional | - |
| `status` | [`Status1Enum \| undefined`](../../doc/models/status-1-enum.md) | Optional | - |
| `buyerId` | `string \| undefined` | Optional | - |
| `providerId` | `string \| null \| undefined` | Optional | - |
| `location` | `string \| undefined` | Optional | - |
| `budget` | `number \| undefined` | Optional | - |
| `price` | `number \| undefined` | Optional | - |
| `fee` | `number \| undefined` | Optional | - |
| `total` | `number \| undefined` | Optional | - |
| `instructions` | `string \| undefined` | Optional | - |
| `completionCriteria` | `string[] \| undefined` | Optional | - |
| `requiredEvidence` | `string[] \| undefined` | Optional | - |
| `payment` | [`Payment \| undefined`](../../doc/models/payment.md) | Optional | - |
| `verification` | [`TaskVerification \| null \| undefined`](../../doc/models/containers/task-verification.md) | Optional | This is a container for one-of cases. |
| `evidence` | [`Evidence[] \| undefined`](../../doc/models/evidence.md) | Optional | - |
| `createdAt` | `string \| undefined` | Optional | - |
| `updatedAt` | `string \| undefined` | Optional | - |
| `completedAt` | `string \| null \| undefined` | Optional | - |

## Example

```ts
import { CategoryEnum, Task } from 'humanfallback-apilib';

const task: Task = {
  id: 'id4',
  code: 'HF-1048',
  title: 'title0',
  description: 'description4',
  category: CategoryEnum.DocumentCollection,
};
```

