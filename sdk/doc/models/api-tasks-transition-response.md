
# Api Tasks Transition Response

## Structure

`ApiTasksTransitionResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `task` | [`Task \| undefined`](../../doc/models/task.md) | Optional | - |

## Example

```ts
import {
  ApiTasksTransitionResponse,
  CategoryEnum,
} from 'humanfallback-apilib';

const apiTasksTransitionResponse: ApiTasksTransitionResponse = {
  task: {
    id: 'id4',
    code: 'code2',
    title: 'title0',
    description: 'description4',
    category: CategoryEnum.DocumentCollection,
  },
};
```

