# Bundled fonts (Open Graph image rendering)

These `.woff` files are used by the `next/og` `ImageResponse` renderer, which
cannot read the site's `next/font/google` output. They are static single-weight
subsets (Latin) of the same families the site uses:

| File                              | Family              | Weight | Where the site uses it            |
| --------------------------------- | ------------------- | ------ | --------------------------------- |
| `CormorantGaramond-SemiBold.woff` | Cormorant Garamond  | 600    | brand wordmark (`font-logo`)      |
| `Manrope-Regular.woff`            | Manrope             | 400    | English body text (`font-sans`)   |
| `Manrope-SemiBold.woff`           | Manrope             | 600    | English body text (`font-sans`)   |

Both families are licensed under the SIL Open Font License 1.1. Source:
the `@fontsource/cormorant-garamond` and `@fontsource/manrope` packages.
