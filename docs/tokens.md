# Design tokens — Jackpot

**Acest fișier este singura punte între Figma și cod.** Dacă se învechește, componentele încep să
conțină culori scrise de mână și nu mai există un loc unic în care să schimbi ceva.

Sursă: fișierul Figma `2MyylxdZblfGnf05nQacUz`, frame-urile `UI Kit — Desktop / Colors` (nod `1:5199`)
și `UI Kit — Mobile / Colors` (nod `1:4745`).

Figma **nu are variabile** în acest fișier — `get_variable_defs` întoarce `{"BG/Quaternary":"#0D1420"}`
pe `desktop-main` și `{}` pe ambele UI Kit-uri. Toate valorile de mai jos sunt citite din fill-urile
swatch-urilor și din textul scris de designer sub fiecare.

Fonturi: **Inter**, **Roboto Flex**, **Bricolage Grotesque** — toate Google Fonts, încărcate cu
`next/font/google`.

---

## 1. Decizia asupra conflictelor

Cele două UI Kit-uri folosesc cinci nume identice cu valori diferite. **Decizia owner-ului: câștigă
valorile din kit-ul Mobile**, aplicate la ambele viewporturi. Un singur token, o singură valoare.

| Nume Figma | Desktop | Mobile | Valoare adoptată |
|---|---|---|---|
| Page Background | `#11111A` | `#0F121D` | `#0F121D` |
| Overlay | `#000000 @ 20%` | `#161625 @ 80%` | `#161625 @ 80%` |
| Secondary Text | `#FFFFFF @ 70%` | `#FFFFFF @ 60%` | `#FFFFFF @ 60%` |
| Blue Tinted BG | `#007AFF @ 13%` | `#007AFF @ 15%` | `#007AFF @ 15%` |
| Card Border | `#FFFFFF @ 4%` | `#262632` | `#262632` |

Decizia se aplică **numai** acestor cinci. Tokenii care există doar în kit-ul Desktop
(`Tertiary Text`, `Nav Inactive`, `Footer Heading`, `Gold Nav Active`, `Subtle Surface`,
`Elevated Surface`, `Border Strong`, `Divider Light`) își păstrează valorile desktop —
nu au corespondent mobil.

Două nume diferite pentru aceeași valoare, unificate:

| Desktop | Mobile | Valoare | Token adoptat |
|---|---|---|---|
| Separator | Divider | `#282936` | `border-separator` |
| Border Medium | Subtle Border | `#FFFFFF @ 8%` | `border-medium` |

### Consecințe cunoscute ale deciziei

Trei abateri față de kit-ul Desktop, acceptate conștient. Fiecare se întoarce cu o singură linie
în `globals.css` dacă la verificarea vizuală din faza 6 deranjează.

1. **`text-secondary` și `text-tertiary` devin identice.** Desktopul avea 70% și 60%, două trepte
   distincte. Mobilul are un singur nivel, 60%. Adoptând mobilul, ambii tokeni ajung la
   `#FFFFFF @ 60%`, deci diferența de ierarhie pe care designerul a desenat-o pe desktop dispare.
   Se vede cel mai clar în footer, unde titlurile de coloană și linkurile secundare foloseau
   trepte diferite.
2. **Panourile de pe desktop se întunecă mult mai tare.** `bg-overlay` trece de la `#000000 @ 20%`
   la `#161625 @ 80%`. Ăsta e stratul care acoperă pagina când se deschide panoul **Balance** din
   header. La 20% pagina din spate rămâne lizibilă; la 80% aproape dispare. Frame-ul
   `Balance Opened` (nod `1:4116`) va arăta vizibil mai închis decât în Figma.
3. **Conturul cardurilor devine opac.** `border-card` trece de la `#FFFFFF @ 4%` — care lasă
   fundalul să transpară — la `#262632`, o culoare plină. Peste `bg-page` diferența e mică; peste
   `bg-section` sau peste o imagine se observă.

---

## 2. Tabelul complet

`D` = apare în UI Kit Desktop · `M` = apare în UI Kit Mobile

### Fundaluri

| Nume Figma | Valoare adoptată | Token Tailwind | Variabilă CSS | Kit |
|---|---|---|---|---|
| Page Background | `#0F121D` | `bg-page` | `--bg-page` | D M |
| Card Background | `#151624` | `bg-card` | `--bg-card` | D M |
| Section Background | `#12162B` | `bg-section` | `--bg-section` | M |
| Overlay | `#161625 @ 80%` | `bg-overlay` | `--bg-overlay` | D M |
| Subtle Surface | `#FFFFFF @ 2%` | `bg-subtle` | `--bg-subtle` | D |
| Elevated Surface | `#FFFFFF @ 6%` | `bg-elevated` | `--bg-elevated` | D |

### Text

| Nume Figma | Valoare adoptată | Token Tailwind | Variabilă CSS | Kit |
|---|---|---|---|---|
| Primary Text | `#FFFFFF` | `text-primary` | `--text-primary` | D M |
| Secondary Text | `#FFFFFF @ 60%` | `text-secondary` | `--text-secondary` | D M |
| Tertiary Text | `#FFFFFF @ 60%` | `text-tertiary` | `--text-tertiary` | D |
| Muted Text | `#839CBF` | `text-muted` | `--text-muted` | D M |
| Caption Text | `#8E9BB0` | `text-caption` | `--text-caption` | M |
| Nav Inactive | `#9E9FAB` | `text-nav` | `--text-nav` | D |
| Label Text | `#B2B8C2` | `text-label` | `--text-label` | D M |
| Footer Heading | `#DAD7E0` | `text-footer-heading` | `--text-footer-heading` | D |

### Accent și brand

| Nume Figma | Valoare adoptată | Token Tailwind | Variabilă CSS | Kit |
|---|---|---|---|---|
| Blue Primary | `#007AFF` | `blue` | `--blue` | D M |
| Blue Tinted BG | `#007AFF @ 15%` | `blue-tint` | `--blue-tint` | D M |
| Amber / Warning | `#F59E0B` | `amber` | `--amber` | D M |
| Gold Nav Active | `#D4A352` | `gold` | `--gold` | D |
| Success Green | `#34C759` | `green` | `--green` | D M |
| Emerald Green | `#00F299` | `emerald` | `--emerald` | M |
| Cyan Accent | `#00F0FF` | `cyan` | `--cyan` | M |

### Gradiente

| Nume Figma | Valoare | Token Tailwind | Variabilă CSS | Kit |
|---|---|---|---|---|
| Gold Light | `#F0C775` | `gold-light` | `--gold-light` | D M |
| Gold Dark | `#C6903D` | `gold-dark` | `--gold-dark` | D M |
| Orange Gradient Start | `#F8B900` | `orange-start` | `--orange-start` | D M |
| Orange Gradient End | `#E67508` | `orange-end` | `--orange-end` | D M |

Gradiente compuse folosite în produs:

| Utilitar | Definiție |
|---|---|
| `bg-gradient-gold` | `linear-gradient(160deg, #F0C775, #C6903D)` |
| `bg-gradient-orange` | `linear-gradient(160deg, #F8B900, #E67508)` |

Acestea sunt și fundalurile placeholder-elor pentru cardurile de joc fără imagine reală.

### Contururi și separatoare

| Nume Figma | Valoare adoptată | Token Tailwind | Variabilă CSS | Kit |
|---|---|---|---|---|
| Card Border | `#262632` | `border-card` | `--border-card` | D M |
| Divider Light | `#FFFFFF @ 7%` | `border-divider` | `--border-divider` | D |
| Border Medium / Subtle Border | `#FFFFFF @ 8%` | `border-medium` | `--border-medium` | D M |
| Border Strong | `#FFFFFF @ 10%` | `border-strong` | `--border-strong` | D |
| Separator / Divider | `#282936` | `border-separator` | `--border-separator` | D M |

### Excepție

| Nume Figma | Valoare | Observație |
|---|---|---|
| BG/Quaternary | `#0D1420` | Singura variabilă Figma din fișier. Nu apare în niciun swatch al celor două UI Kit-uri. Se folosește doar unde nodul o cere explicit; nu devine token. |

---

## 3. Total

- 26 de culori în UI Kit Desktop, 22 în UI Kit Mobile
- **30 de tokeni distincți** după unificarea numelor duplicate și rezolvarea conflictelor
- 2 gradiente compuse
- 1 excepție documentată

## 4. Regula de disciplină

Nicio componentă din `src/components/` nu are voie să conțină un cod hexazecimal scris direct.
Se aplică printr-o regulă `eslint` care respinge `#[0-9a-fA-F]{3,8}` în acel director.
Orice excepție se scrie aici, cu motivul ei.
