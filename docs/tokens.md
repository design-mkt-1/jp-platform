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

| Nume Figma      | Desktop         | Mobile          | Valoare adoptată                             |
| --------------- | --------------- | --------------- | -------------------------------------------- |
| Page Background | `#11111A`       | `#0F121D`       | `#0F121D`                                    |
| Overlay         | `#000000 @ 20%` | `#161625 @ 80%` | **ambele, comutate la 768px** — vezi mai jos |
| Secondary Text  | `#FFFFFF @ 70%` | `#FFFFFF @ 60%` | `#FFFFFF @ 60%`                              |
| Blue Tinted BG  | `#007AFF @ 13%` | `#007AFF @ 15%` | `#007AFF @ 15%`                              |
| Card Border     | `#FFFFFF @ 4%`  | `#262632`       | `#262632`                                    |

### Singura excepție: `bg-overlay`

Regula rămâne o valoare per token. `bg-overlay` e excepția, prin decizia owner-ului luată după
verificarea vizuală, pentru că aici cele două kit-uri diferă dintr-un motiv, nu din neatenție:

- pe **desktop** stratul stă în spatele unui panou mic din colț (nodul `1:4116`) — negru la 20%,
  pagina rămâne lizibilă
- pe **mobil** stă în spatele unei foi care acoperă aproape tot ecranul — `#161625` la 80%

Forțarea unei singure valori făcea panourile de pe desktop mult mai închise decât în design.
Comutarea se face în `globals.css` printr-un `@media (max-width: 767px)`.
Orice alt token care ar vrea a doua valoare are nevoie de o justificare de aceeași natură.

Decizia se aplică **numai** acestor cinci. Tokenii care există doar în kit-ul Desktop
(`Tertiary Text`, `Nav Inactive`, `Footer Heading`, `Gold Nav Active`, `Subtle Surface`,
`Elevated Surface`, `Border Strong`, `Divider Light`) își păstrează valorile desktop —
nu au corespondent mobil.

Două nume diferite pentru aceeași valoare, unificate:

| Desktop       | Mobile        | Valoare        | Token adoptat      |
| ------------- | ------------- | -------------- | ------------------ |
| Separator     | Divider       | `#282936`      | `border-separator` |
| Border Medium | Subtle Border | `#FFFFFF @ 8%` | `border-medium`    |

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

| Nume Figma         | Valoare adoptată | Token Tailwind | Variabilă CSS   | Kit |
| ------------------ | ---------------- | -------------- | --------------- | --- |
| Page Background    | `#0F121D`        | `bg-page`      | `--bg-page`     | D M |
| Card Background    | `#151624`        | `bg-card`      | `--bg-card`     | D M |
| Section Background | `#12162B`        | `bg-section`   | `--bg-section`  | M   |
| Overlay            | `#161625 @ 80%`  | `bg-overlay`   | `--bg-overlay`  | D M |
| Subtle Surface     | `#FFFFFF @ 2%`   | `bg-subtle`    | `--bg-subtle`   | D   |
| Elevated Surface   | `#FFFFFF @ 6%`   | `bg-elevated`  | `--bg-elevated` | D   |

#### Stările butonului-iconiță (nod `1:5687`)

Frame-ul `Icon Button (Search)` fixează un cerc de 40x40 (`Border Radius: 20px (circle)`,
`Padding: N/A — fixed 40x40`) și îi scrie cele trei stări sub fiecare exemplar din `States`
(`1:5697`). Repausul este chiar `--bg-elevated`, deci nu primește token nou. Umbră: niciuna, în
toate trei.

| Stare în Figma | Valoare adoptată | Token Tailwind     | Variabilă CSS          |
| -------------- | ---------------- | ------------------ | ---------------------- |
| `DEFAULT`      | `#FFFFFF @ 6%`   | `bg-elevated`      | `--bg-elevated`        |
| `HOVER`        | `#FFFFFF @ 12%`  | `bg-icon-btn-hover`  | `--bg-icon-btn-hover`  |
| `ACTIVE`       | `#FFFFFF @ 4%`   | `bg-icon-btn-active` | `--bg-icon-btn-active` |

Apăsatul este mai deschis decât repausul — așa scrie nodul, nu e o inversare din cod.

Cercul stătea până acum desenat în asset: `public/images/icons/search-btn.svg` își aducea propriul
`<rect width="40" height="40" rx="20" fill="white" fill-opacity="0.0588"/>`, așa că hover și
apăsat nu aveau ce muta. Fișierul păstrează doar glifa (20x20), iar cercul îl pune
`src/components/primitives/IconButton.tsx`.

### Text

| Nume Figma     | Valoare adoptată | Token Tailwind        | Variabilă CSS           | Kit |
| -------------- | ---------------- | --------------------- | ----------------------- | --- |
| Primary Text   | `#FFFFFF`        | `text-primary`        | `--text-primary`        | D M |
| Secondary Text | `#FFFFFF @ 60%`  | `text-secondary`      | `--text-secondary`      | D M |
| Tertiary Text  | `#FFFFFF @ 60%`  | `text-tertiary`       | `--text-tertiary`       | D   |
| Muted Text     | `#839CBF`        | `text-muted`          | `--text-muted`          | D M |
| Caption Text   | `#8E9BB0`        | `text-caption`        | `--text-caption`        | M   |
| Nav Inactive   | `#9E9FAB`        | `text-nav`            | `--text-nav`            | D   |
| Label Text     | `#B2B8C2`        | `text-label`          | `--text-label`          | D M |
| Footer Heading | `#DAD7E0`        | `text-footer-heading` | `--text-footer-heading` | D   |

### Accent și brand

| Nume Figma      | Valoare adoptată | Token Tailwind | Variabilă CSS | Kit |
| --------------- | ---------------- | -------------- | ------------- | --- |
| Blue Primary    | `#006EE6` ¹      | `blue`         | `--blue`      | D M |
| Blue Tinted BG  | `#007AFF @ 15%`  | `blue-tint`    | `--blue-tint` | D M |
| — (derivat) ¹   | `#479FFF`        | `blue-text`    | `--blue-text` | —   |
| Amber / Warning | `#F59E0B`        | `amber`        | `--amber`     | D M |
| Gold Nav Active | `#D4A352`        | `gold`         | `--gold`      | D   |
| Success Green   | `#34C759`        | `green`        | `--green`     | D M |
| Emerald Green   | `#00F299`        | `emerald`      | `--emerald`   | M   |
| Cyan Accent     | `#00F0FF`        | `cyan`         | `--cyan`      | M   |

¹ Figma scrie `#007AFF` în ambele kit-uri. Nu trece AA nici ca fundal sub text alb, nici ca text pe
tentele albastre, așa că albastrul e acum două valori — vezi „Abateri de contrast" din §2b. Tentele
(`--blue-tint`, `--see-all-bg`) păstrează canalele `0 122 255` ale designului: sunt fundaluri, iar
închiderea lor ar fi înrăutățit exact textul pe care îl susțin.

### Gradiente

| Nume Figma            | Valoare   | Token Tailwind | Variabilă CSS    | Kit |
| --------------------- | --------- | -------------- | ---------------- | --- |
| Gold Light            | `#F0C775` | `gold-light`   | `--gold-light`   | D M |
| Gold Dark             | `#C6903D` | `gold-dark`    | `--gold-dark`    | D M |
| Orange Gradient Start | `#F8B900` | `orange-start` | `--orange-start` | D M |
| Orange Gradient End   | `#E67508` | `orange-end`   | `--orange-end`   | D M |

Gradiente compuse folosite în produs:

| Utilitar             | Definiție                                   |
| -------------------- | ------------------------------------------- |
| `bg-gradient-gold`   | `linear-gradient(160deg, #F0C775, #C6903D)` |
| `bg-gradient-orange` | `linear-gradient(160deg, #F8B900, #E67508)` |

Acestea sunt și fundalurile placeholder-elor pentru cardurile de joc fără imagine reală.

### Contururi și separatoare

| Nume Figma                    | Valoare adoptată | Token Tailwind     | Variabilă CSS        | Kit |
| ----------------------------- | ---------------- | ------------------ | -------------------- | --- |
| Card Border                   | `#262632`        | `border-card`      | `--border-card`      | D M |
| Divider Light                 | `#FFFFFF @ 7%`   | `border-divider`   | `--border-divider`   | D   |
| Border Medium / Subtle Border | `#FFFFFF @ 8%`   | `border-medium`    | `--border-medium`    | D M |
| Border Strong                 | `#FFFFFF @ 10%`  | `border-strong`    | `--border-strong`    | D   |
| Separator / Divider           | `#282936`        | `border-separator` | `--border-separator` | D M |

### Excepție

| Nume Figma    | Valoare   | Observație                                                                                                                                             |
| ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BG/Quaternary | `#0D1420` | Singura variabilă Figma din fișier. Nu apare în niciun swatch al celor două UI Kit-uri. Se folosește doar unde nodul o cere explicit; nu devine token. |

---

## 2b. Valori din layere, absente din ambele UI Kit-uri

Cele două UI Kit-uri nu acoperă tot ce e desenat efectiv în pagini. Agenții care au construit
header-ul, footer-ul și bannerele au dat peste valorile de mai jos, au refuzat corect să le scrie
ca hex în componente și le-au cerut în rapoarte. Sunt transcrise aici din nodurile indicate.

**Regula:** orice adăugare în acest tabel trebuie să citeze nodul din care vine. Fără citare,
lista devine un depozit de culori ad-hoc și ne întoarcem exact la problema pe care tokenii o rezolvă.

| Valoare         | Token Tailwind    | Variabilă CSS       | Nod Figma                             | Unde apare                                                                   |
| --------------- | ----------------- | ------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `#080814`       | `bg-header`       | `--bg-header`       | `1:4245`                              | bara de header, mai închisă decât pagina                                     |
| `#18273A`       | `border-header`   | `--border-header`   | `1:4245`                              | linia de sub header                                                          |
| `#070F1D`       | `bg-footer`       | `--bg-footer`       | `1:3666`                              | suprafața footerului                                                         |
| `#1A1D2E`       | `bg-field`        | `--bg-field`        | `1:4314`                              | umplerea câmpului de căutare                                                 |
| `#F2C146 @ 10%` | `bg-amber-tint`   | `--amber-tint`      | `1:3446`, `1:3538`, `1:3594`–`1:3600` | pastilele de avertizare de pe bannerele promo                                |
| `#19191D`       | `border-flag`     | `--border-flag`     | `1:4016`                              | inelul din jurul steagurilor de limbă                                        |
| `#7F7A85` ¹     | `text-legal`      | `--text-legal`      | `1:4115`                              | banda legală din footer                                                      |
| `#FFFFFF @ 15%` | `border-emphasis` | `--border-emphasis` | `1:2433`                              | separatorul din tickerul de câștiguri                                        |
| `#A5A6B5`       | `text-subtitle`   | `--text-subtitle`   | `1:6254`                              | subtitlul cardului promo de mobil                                            |
| `#F2C146`       | `amber-soft`      | `--amber-soft`      | `1:6255`                              | pastila „join + timer" de pe cardul promo de mobil, plină                    |
| `#09090D`       | `ink`             | `--ink`             | `1:6256`–`1:6260`                     | textul scris **pe** pastila aceea: eticheta butonului, „Time left" și ceasul |

¹ Figma scrie `#65616A`. Ridicat la `#7F7A85` pentru AA — vezi „Abateri de contrast" mai jos.

Niciuna dintre cele trei nu apare în cele două UI Kit-uri: tabelele de la §2 sunt transcrierea lor
completă (26 de swatch-uri Desktop, 22 Mobile) și nu conțin nici `#A5A6B5`, nici `#09090D`, iar
`#F2C146` apare acolo doar la 10% opacitate, ca `--amber-tint`. `--amber-soft` e aceeași culoare
în formă plină, nu un al doilea chihlimbar.

Două valori derivate din `--ink` nu primesc token propriu, pentru că tema ține culori finite, nu
canale RGB — vezi comentariul din `Button.tsx`. Fiecare e o clasă de opacitate pe elementul care o
folosește, ceea ce e o schimbare mai mică decât un token folosit o singură dată:

| Design                                                | Cum se scrie                           | Nod      |
| ----------------------------------------------------- | -------------------------------------- | -------- |
| `#09090D @ 80%` — eticheta „Time left"                | `text-ink opacity-80`                  | `1:6259` |
| `#09090D @ 15%` — linia verticală de 16px din pastilă | `bg-ink opacity-15`, pe un span de 1px | `1:6257` |

### Abateri acceptate, fără token nou

Trei valori din design sunt suficient de aproape de un token existent încât un token nou ar
adăuga zgomot fără câștig vizibil. Sunt notate ca să nu fie redescoperite ca „bug" la verificarea vizuală.

| Design                                                            | Token folosit        | Diferența                                                                                                                                  |
| ----------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `#00E5FF` (inelul pastilei active, nod `1:2503`)                  | `cyan` `#00F0FF`     | imperceptibilă                                                                                                                             |
| `#FFFFFF @ 9%` (fundalul pastilei active)                         | `bg-elevated` `@ 6%` | 3 puncte de opacitate                                                                                                                      |
| `#11111A` (fundalul cardului de joc, nod `1:2602`)                | `bg-card` `#151624`  | `#11111A` e fundalul de pagină **desktop**, pe care decizia „câștigă mobile" l-a înlocuit cu `#0F121D`                                     |
| `#000000` (eticheta butonului din pastilă, nod `I1:6256;112:330`) | `ink` `#09090D`      | Figma scrie negru pur pe buton și `#09090D` pe ceasul de lângă el, la 3px distanță. Diferența e imperceptibilă, deci ambele folosesc `ink` |

### Abateri de contrast — decizie de proprietar, 2026-09-08

`node scripts/a11y.mjs` (axe-core 4.10.2, nouă stări, mobile first) raporta 12–15 încălcări
`color-contrast` de gravitate „serious" pe fiecare stare. Toate veneau din patru perechi de culori
luate ca atare din Figma, nu inventate aici. Decizia proprietarului: se schimbă culorile până când
regula trece AA (4,5:1 pentru text normal), iar abaterea față de Figma se scrie aici.

Fiecare valoare nouă păstrează exact nuanța și saturația originalului; s-a mutat numai
luminozitatea. `#006EE6` sunt canalele `0 122 255` înmulțite cu 0,9 — nuanță 211,3° și saturație
100%, la fel ca `#007AFF`. `#479FFF` e aceeași nuanță și saturație urcată la luminozitate 64%.
`#7F7A85` e nuanța 266,7° și saturația 4,4% ale lui `#65616A`, la luminozitate 50% în loc de 39,8%.

| Token                | Nod Figma          | Valoare Figma | Valoare nouă | Unde se vede                                                                 | Raport înainte → după |
| -------------------- | ------------------ | ------------- | ------------ | ---------------------------------------------------------------------------- | --------------------- |
| `--blue`             | `1:5199` / `1:4745` | `#007AFF`     | `#006EE6`    | alb pe albastru plin: pastila „Get" din hero-ul mobil, `Button` `primaryBlue` | 4,02:1 → 4,80:1      |
| `--blue-text` (nou)  | `1:5199` / `1:4745` | `#007AFF`     | `#479FFF`    | text albastru pe tentă: pastila `See All (206)` (`1:5655`), badge-urile albastre din sugestii (`1:4479`), pastila-eyebrow din hero-ul mobil (`1:5756`) | 3,51–4,06:1 → 5,15–5,97:1 |
| `--text-legal`       | `1:4115`           | `#65616A`     | `#7F7A85`    | banda legală din footer                                                      | 3,17:1 → 4,58:1      |

Rapoartele sunt calculate cu formula WCAG 2.1 pe **fundalul compus efectiv** — tenta așezată peste
suprafața de sub ea, nu peste alb — și sunt confirmate de axe-core, care raportează aceleași
numere în `passes`:

| Perechea măsurată                                                | Fundal compus | Raport |
| ------------------------------------------------------------------ | ------------- | ------ |
| `#FFFFFF` pe `--blue`                                               | `#006EE6`     | 4,80:1 |
| `--blue-text` pe `--see-all-bg` (13% peste `--bg-page`)             | `#0D203A`     | 5,97:1 |
| `--blue-text` pe `--see-all-bg-hover` (22%)                         | `#0C294F`     | 5,31:1 |
| `--blue-text` pe `--see-all-bg-active` (30%)                        | `#0B3161`     | 4,72:1 |
| `--blue-text` pe `--blue-tint` peste `--bg-field`                   | `#162B4D`     | 5,15:1 |
| `--blue-text` pe `--blue-tint` peste `--bg-section`                 | `#0F254B`     | 5,53:1 |
| `--text-legal` pe `--bg-footer`                                     | `#070F1D`     | 4,58:1 |

Cele două stări ale pastilei `See All` sunt în tabel pentru că axe măsoară numai starea de repaus:
hover și apăsat au fost calculate separat, ca schimbarea să nu treacă AA doar cât timp nu atinge
nimeni butonul.

A patra pereche, banda legală din footer, nu era în lista celor trei din raport, dar produce câte o
încălcare „serious" în fiecare din cele nouă stări, deci `a11y.mjs` nu putea ieși cu 0 fără ea.

### Animații

| Utilitar                   | Definiție                                       | Nod Figma |
| -------------------------- | ----------------------------------------------- | --------- |
| `.animate-marquee`         | translație de la 0 la −50%, 40s liniar, infinit | `1:2658`  |
| `.animate-marquee-reverse` | inversul, pentru a doua bandă                   | `1:2919`  |

Banda de provideri e desenată în Figma ca o pistă de 1680px într-un decupaj de 1280px — adică un
marquee. Pista trebuie să își randeze elementele de două ori, ca bucla să nu aibă cusătură.
Ambele respectă `prefers-reduced-motion`.

---

## 3. Total

- 26 de culori în UI Kit Desktop, 22 în UI Kit Mobile
- **34 de tokeni distincți** după unificarea numelor duplicate și rezolvarea conflictelor (30 din primul val, plus `text-subtitle`, `amber-soft` și `ink`, cerute de cardurile promo de mobil, plus `blue-text`, cerut de pragul AA)
- 2 gradiente compuse
- 1 excepție documentată

## 4. Regula de disciplină

Nicio componentă din `src/components/` nu are voie să conțină un cod hexazecimal scris direct.
Se aplică printr-o regulă `eslint` care respinge `#[0-9a-fA-F]{3,8}` în acel director.
Orice excepție se scrie aici, cu motivul ei.
