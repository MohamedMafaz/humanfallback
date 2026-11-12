
# Api Tasks Capture Response

## Structure

`ApiTasksCaptureResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `task` | [`Task \| undefined`](../../doc/models/task.md) | Optional | - |
| `captureId` | `string \| null \| undefined` | Optional | - |
| `idempotent` | `boolean \| undefined` | Optional | - |

## Example

```ts
import { ApiTasksCaptureResponse, CategoryEnum } from 'humanfallback-apilib';

const apiTasksCaptureResponse: ApiTasksCaptureResponse = {
  task: {
    id: 'id4',
    code: 'code2',
    title: 'title0',
    description: 'description4',
    category: CategoryEnum.DocumentCollection,
  },
  captureId: 'captureId6',
  idempotent: false,
};
```

