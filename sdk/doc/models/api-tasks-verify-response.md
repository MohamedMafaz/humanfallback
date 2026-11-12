
# Api Tasks Verify Response

## Structure

`ApiTasksVerifyResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `verification` | [`Verification \| undefined`](../../doc/models/verification.md) | Optional | - |
| `task` | [`Task \| undefined`](../../doc/models/task.md) | Optional | - |

## Example

```ts
import {
  ApiTasksVerifyResponse,
  CategoryEnum,
  VerdictEnum,
} from 'humanfallback-apilib';

const apiTasksVerifyResponse: ApiTasksVerifyResponse = {
  verification: {
    verdict: VerdictEnum.Verified,
    confidence: 1,
    summary: 'summary6',
    missing: [
      'missing0'
    ],
    extracted: {
      'key0': 'extracted6',
      'key1': 'extracted7',
      'key2': 'extracted8'
    },
  },
  task: {
    id: 'id4',
    code: 'code2',
    title: 'title0',
    description: 'description4',
    category: CategoryEnum.DocumentCollection,
  },
};
```

