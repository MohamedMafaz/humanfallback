
# Verification

## Structure

`Verification`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `verdict` | [`VerdictEnum \| undefined`](../../doc/models/verdict-enum.md) | Optional | - |
| `confidence` | `number \| undefined` | Optional | **Constraints**: `>= 0`, `<= 1` |
| `summary` | `string \| undefined` | Optional | - |
| `missing` | `string[] \| undefined` | Optional | - |
| `extracted` | `Record<string, string> \| null \| undefined` | Optional | - |
| `model` | `string \| undefined` | Optional | - |
| `advisory` | `boolean \| undefined` | Optional | - |
| `createdAt` | `string \| undefined` | Optional | - |

## Example

```ts
import { VerdictEnum, Verification } from 'humanfallback-apilib';

const verification: Verification = {
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
};
```

