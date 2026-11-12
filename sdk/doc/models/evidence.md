
# Evidence

## Structure

`Evidence`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string \| undefined` | Optional | - |
| `kind` | [`KindEnum \| undefined`](../../doc/models/kind-enum.md) | Optional | - |
| `fileName` | `string \| undefined` | Optional | - |
| `url` | `string \| undefined` | Optional | - |
| `mimeType` | `string \| undefined` | Optional | - |
| `sizeBytes` | `number \| undefined` | Optional | - |
| `note` | `string \| undefined` | Optional | - |
| `uploadedById` | `string \| undefined` | Optional | - |
| `uploadedAt` | `string \| undefined` | Optional | - |

## Example

```ts
import { Evidence, KindEnum } from 'humanfallback-apilib';

const evidence: Evidence = {
  id: 'id2',
  kind: KindEnum.Image,
  fileName: 'fileName6',
  url: 'url6',
  mimeType: 'mimeType6',
};
```

