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
| Blue Primary    | `#007AFF`        | `blue`         | `--blue`      | D M |
| Blue Tinted BG  | `#007AFF @ 15%`  | `blue-tint`    | `--blue-tint` | D M |
| Amber / Warning | `#F59E0B`        | `amber`        | `--amber`     | D M |
| Gold Nav Active | `#D4A352`        | `gold`         | `--gold`      | D   |
| Success Green   | `#34C759`        | `green`        | `--green`     | D M |
| Emerald Green   | `#00F299`        | `emerald`      | `--emerald`   | M   |
| Cyan Accent     | `#00F0FF`        | `cyan`         | `--cyan`      | M   |

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
| `#65616A`       | `text-legal`      | `--text-legal`      | `1:4115`                              | banda legală din footer                                                      |
| `#FFFFFF @ 15%` | `border-emphasis` | `--border-emphasis` | `1:2433`                              | separatorul din tickerul de câștiguri                                        |
| `#A5A6B5`       | `text-subtitle`   | `--text-subtitle`   | `1:6254`                              | subtitlul cardului promo de mobil                                            |
| `#F2C146`       | `amber-soft`      | `--amber-soft`      | `1:6255`                              | pastila „join + timer" de pe cardul promo de mobil, plină                    |
| `#09090D`       | `ink`             | `--ink`             | `1:6256`–`1:6260`                     | textul scris **pe** pastila aceea: eticheta butonului, „Time left" și ceasul |

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
- **33 de tokeni distincți** după unificarea numelor duplicate și rezolvarea conflictelor (30 din primul val, plus `text-subtitle`, `amber-soft` și `ink`, cerute de cardurile promo de mobil)
- 2 gradiente compuse
- 1 excepție documentată

## 4. Regula de disciplină

Nicio componentă din `src/components/` nu are voie să conțină un cod hexazecimal scris direct.
Se aplică printr-o regulă `eslint` care respinge `#[0-9a-fA-F]{3,8}` în acel director.
Orice excepție se scrie aici, cu motivul ei.
