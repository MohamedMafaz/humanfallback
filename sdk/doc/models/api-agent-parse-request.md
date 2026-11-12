
# Api Agent Parse Request

## Structure

`ApiAgentParseRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `prompt` | `string` | Required | **Constraints**: *Minimum Length*: `8` |
| `location` | `string \| undefined` | Optional | - |
| `budget` | `number \| undefined` | Optional | **Constraints**: `>= 5`, `<= 500` |

## Example

```ts
import { ApiAgentParseRequest } from 'humanfallback-apilib';

const apiAgentParseRequest: ApiAgentParseRequest = {
  prompt: 'Go to my office, inspect the electricity meter and send me a photograph of the reading. Budget $10.',
  location: 'location2',
  budget: 19.38,
};
```

