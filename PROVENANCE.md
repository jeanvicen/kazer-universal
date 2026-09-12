# Provenance

Toda entrada incorporada ou adaptada deve ter um registro em `provenance/` ou no registry persistente.

Campos mínimos:

- `name`
- `upstream`
- `repository`
- `commitSha`
- `release`
- `importDate`
- `license`
- `copyright`
- `noticeFiles`
- `modifications`
- `kazerAdapter`
- `classification`
- `reviewStatus`

O arquivo `THIRD_PARTY_NOTICES.md` deve ser gerado ou revisado antes de cada release. A ausência de um campo obrigatório impede a classificação como `embedded`.
