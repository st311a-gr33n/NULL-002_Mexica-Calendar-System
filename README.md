# NULL-002 — Mexica Calendar Systems

A minimal, dependency-free web clock that renders the current date as a
[Mexica (Aztec) calendar](https://en.wikipedia.org/wiki/Aztec_calendar). It
shows the 260-day Tonalpohualli, the 365-day Xiuhpohualli, and their combined
52-year Calendar Round. Because no uninterrupted count survives, the readout is
an explicit model projection built on the CR-01 / Rafael Tena correlation.

## How it works

The app converts the browser's local Gregorian date into the two Mesoamerican
counts using a fixed historical anchor. Historical Julian dates are converted to
their equivalent Gregorian dates for day counting; the modern display date uses
the browser's local Gregorian date.

### 1. The anchor

CR-01 fixes 1 Cóatl to 13 August 1521 Julian (23 August Gregorian), reported for
the fall of Tenochtitlan:

```
anchor = 23 August 1521 (Gregorian)
```

Every date is measured in whole days before or after this anchor.

### 2. Tonalpohualli (260-day sacred count)

Days since the anchor are reduced modulo 260 into an interlocking 13-number ×
20-day-sign combination:

```
number = (offset mod 13) + 1
sign   = signs[(4 + offset) mod 20]
```

where `offset` is the day difference from the anchor. The estimate advances from
the historical 1 Cóatl anchor, accounting for Tena's pre-conquest intercalary day
(the duplicated sixth nemontemi repeats the previous tonalli, so it advances the
solar count but not the 260-day count).

### 3. Xiuhpohualli (365-day solar year)

Days since the reconstructed year boundary are split into 18 veintenas of 20 days
followed by 5 nemontemi days:

```
yearOffset = floor(elapsed / 365)
dayOfYear  = elapsed mod 365
month      = floor(dayOfYear / 20)
day        = (dayOfYear mod 20) + 1
```

Tena adds a sixth nemontemi in the pre-conquest 2 Técpatl year; the post-conquest
projection does not extend that intercalation.

### 4. Calendar Round (52-year cycle)

The two counts return to the same pairing every 18,980 days:

```
73 × 260 = 52 × 365 = 18,980 days
```

Its Gregorian placement is reported with ≈ to mark it as an estimate under Tena's
historical model.

## The cycles

| Cycle | Days | Composed of | Roughly |
| --- | ---: | --- | --- |
| **Tonalpohualli** | 260 | 13 numbers × 20 day signs | ~0.71 solar years |
| **Xiuhpohualli** | 365 | 18 veintenas + 5 nemontemi | ~1 solar year |
| **Calendar Round** | 18,980 | 73 tonalpohuallis = 52 years | ~52 solar years |

## Interaction

- **Hover / focus a row** — highlights the layer, dims the others, and shows its
  cycle length above and its estimate note below the value.
- **Click a row**, or focus it and press Enter/Space — expands its explanation.
  Press Escape to close the focused row.
- **Use the correlation control** near the bottom to read the CR-01 status.

## Validation

The script checks three reference points at startup: 1 Cóatl on the 1521 anchor;
8 Ehécatl on 8 November 1519 Julian (with the repeated intercalary day handled);
and 1 Atlcahualo, 3 Calli at Tena's reconstructed year boundary. A failed check
is exposed as `data-calendar-check="failed"` on the document root and logged to
the console.

The historical mapping is approximate and becomes less secure farther from the
conquest period. Useful starting references:

- [Alfonso Caso, "Nuevos datos para la correlación de los años aztecas y cristiano"](https://nahuatl.historicas.unam.mx/index.php/ecn/article/download/78644/69585/231804)
- [Ivan Šprajc, "Problema de ajustes del año calendárico mesoamericano al año trópico"](https://doi.org/10.22201/iia.24486221e.2000.1.394)
- [Arqueología Mexicana, "El año bisiesto y la cultura nahua"](https://www.arqueologiamexicana.mx/mexico-antiguo/el-ano-bisiesto-y-la-cultura-nahua)
- [Rafael Tena, *El calendario mexica y la cronografía* (INAH catalog record)](https://catalogo.uacm.edu.mx/bib/32218)

## Tech

Plain HTML, CSS, and JavaScript. No dependencies, no build step — just open
`index.html` in a browser.

## License

All rights reserved.
