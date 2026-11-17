---
name: ładnie
description: Ładny Wygląd – układ każdej odpowiedzi końcowej po wykonanej pracy (zdanie ▶, Wyjaśnienie, pytania, zadania, stany). Stosuj zawsze w odpowiedzi końcowej po pracy, w czacie, Cowork i Claude Code.
---

# Ładny Wygląd – układ odpowiedzi końcowej

Odpowiedź po wykonanej pracy ma stały układ, żeby rozmówca od razu widział, co się stało i czego od niego potrzeba. Odpowiedź na zwykłe pytanie albo rozmowa, bez wykonanej pracy, nie potrzebuje tego układu.

## Zasady treści

1. **Najważniejsze najpierw.** Pierwsze zdanie mówi wynik, nie opis pracy. Prosty język, bez skrótów i nazw plików.
2. **Mało tekstu.** Punkt to jedna rzecz, najwyżej trzy zdania; pierwsze zdanie punktu pogrubione i niesie całą treść. Nic innego nie pogrubiaj. Szczegóły dopiero, gdy rozmówca dopyta.
3. **Decyzje to pytania, czynności to zadania.** Gdy rozmówca ma wybrać, zadajesz pytanie z opcjami. Gdy ma coś zrobić sam, dajesz zadanie. Nigdy nie mieszaj.
4. **Pokaż to, o co pytasz.** Pytasz o ocenę albo wybór czegoś, co da się zobaczyć (tekst, mail, wygląd, grafika)? W tej samej odpowiedzi pokaż to, a przy kilku opcjach każdą osobno.
5. **Szkic maila lub wiadomości** zawsze w bloku oznaczonym `mail`: linie „Od:”, „Do:”, opcjonalnie „DW:”, „Temat:”, pusta linia i sama treść, dokładnie tak, jak ma pójść. Wysyłasz dopiero po wyraźnym „wyślij” rozmówcy.
6. **Linki:** każdy adres i plik jako `[krótka nazwa](adres)`, nigdy goły adres. Ścieżkę ze spacją weź w nawiasy ostre: `[nazwa](<C:\Folder ze spacją\plik.docx>)`.

## Układ, gdy jest narzędzie do wizualizacji (czat claude.ai, Cowork)

Całą odpowiedź rysujesz w jednym obrazie, jako ostatnie narzędzie przed odpowiedzią końcową.

- **Góra obrazu, bez tła:** mała szara linia „Odpowiedź N · dziś GG:MM” (13px, `--text-secondary`), pod nią ikona `ti-player-play` i zdanie z wynikiem (18px, pogrubione, `--text-primary`).
- **Pod spodem bloki**, w tej kolejności, każdy tylko gdy występuje. Każdy ma taką samą etykietę: ikona 18px i nazwa 13px w kolorze bloku.
  - **Wyjaśnienie:** tło `--surface-1`, etykieta `ti-info-circle` w `--text-secondary`; punkty w osobnych akapitach 15px: pogrubione pierwsze zdanie w `--text-primary`, reszta w `--text-secondary`.
  - **Czeka na Ciebie · decyzja:** tło `--bg-warning`, etykieta `ti-help-circle`; „Pytanie 1: …?” 16px pogrubione; „Dlaczego to ważne: …” 14px szare; tabela opcji Opcja | Co się stanie | Plus | Minus (`table-layout:fixed`, 14% / 36% / 25% / 25%, 14px, cienkie linie między wierszami, polecana opcja „1A ★”, Plus i Minus w `--text-secondary`); pod tabelą „➜ Polecam 1A, bo …”; pod nią mała linia „Odpisz 1A albo 1B.”. Bez przycisków: były zbyt jaskrawe i często zgłaszały błąd.
  - **Czeka na Ciebie · zadanie:** tło `--bg-accent`, etykieta `ti-hand-finger`; „Zadanie 1: …” 16px pogrubione; jedno zdanie, po co, 14px szare; kroki „K1A …” 15px. Jedno zadanie to jeden cel; kolejne czynności do tego celu to kroki, nie osobne zadania.
  - **Nie udało się:** tło `--bg-danger`, etykieta `ti-alert-triangle`; każdy punkt w osobnym wierszu w `--text-danger`: `ti-lock` „Brak uprawnień: …” albo `ti-x` przy innym błędzie.
  - **Jeszcze sprawdzam:** tło `--surface-1`, etykieta `ti-search`, punkty z `ti-point` w `--text-secondary`.
  - **Czeka na innych:** tło `--surface-1`, etykieta `ti-hourglass`, punkty z `ti-user`: „Imię: na co czekamy”.
  - **Zrobione:** tło `--bg-success`, etykieta `ti-circle-check`, punkty z `ti-check` w `--text-success`.
- Wszystkie bloki: zaokrąglone rogi 12px, odstęp 12px 16px w środku i 10px między blokami, bez paska z boku. Punkty w blokach stanu do 8 słów. Kolory tylko ze zmiennych motywu, żeby działały w jasnym i ciemnym motywie.
- **Pod obrazem** tylko jedno krótkie zdanie, czego potrzebujesz („Czekam na 1A albo 1B.”), albo „Nic nie musisz robić.”. Bloków nie powtarzasz tekstem.

## Układ bez narzędzia do wizualizacji (Claude Code, telefon)

1. Pierwsza linia: `▶ ` i jedno zdanie z wynikiem.
2. Wyjaśnienie w punktach „- ”, każdy zaczęty od pogrubionego zdania.
3. Sekcje rozdzielone linią `---`, tylko te, które występują: `**Zrobione**`, `**Nie udało się**`, `**Jeszcze sprawdzam**`, `**Czeka na innych**`, `**Zadania dla Ciebie**`, `**Pytania do Ciebie**`.
4. Zadania: lista numerowana „1. Co zrobić – po co i co się stanie bez tego”, kroki jako wcięte „   a) …”, „   b) …”. Rozmówca odpisuje „1 zrobione”.
5. Pytania: „**1. Pytanie?**”, linia „Dlaczego to ważne: …”, każda opcja w osobnej linii „- **A)** co się stanie – plus: …; minus: …”, na końcu „➜ Polecam 1A, bo …”. Rozmówca odpisuje „1A”.
