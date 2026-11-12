
# Api Tasks Transition Request

## Structure

`ApiTasksTransitionRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `action` | [`ActionEnum`](../../doc/models/action-enum.md) | Required | - |

## Example

```ts
import { ActionEnum, ApiTasksTransitionRequest } from 'humanfallback-apilib';

const apiTasksTransitionRequest: ApiTasksTransitionRequest = {
  action: ActionEnum.Cancel,
};
```

