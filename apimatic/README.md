# APIMatic build folder

This is the input directory the APIMatic CLI consumes.

```
apimatic/
  src/
    APIMATIC-BUILD.json     # build configuration
    spec/humanfallback.yaml # the OpenAPI 3.1 contract (copy of ../../openapi/)
```

Regenerate the SDK or documentation portal:

```bash
npm run apimatic:validate   # apimatic api validate --file=./openapi/humanfallback.yaml
npm run apimatic:sdk        # -> ./sdk (TypeScript)
npm run apimatic:portal     # -> ./portal
```

The CLI needs an APIMatic account (`apimatic auth login`, or pass `--auth-key`).
The generated TypeScript client in `../sdk` was produced from this folder with
`apimatic sdk generate --language=typescript --input=./apimatic --destination=./sdk --zip`.
