
# Api Tasks Evidence Response

## Structure

`ApiTasksEvidenceResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `evidence` | [`Evidence \| undefined`](../../doc/models/evidence.md) | Optional | - |
| `task` | [`Task \| undefined`](../../doc/models/task.md) | Optional | - |

## Example

```ts
import {
  ApiTasksEvidenceResponse,
  CategoryEnum,
  KindEnum,
} from 'humanfallback-apilib';

const apiTasksEvidenceResponse: ApiTasksEvidenceResponse = {
  evidence: {
    id: 'id2',
    kind: KindEnum.Image,
    fileName: 'fileName6',
    url: 'url6',
    mimeType: 'mimeType6',
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

