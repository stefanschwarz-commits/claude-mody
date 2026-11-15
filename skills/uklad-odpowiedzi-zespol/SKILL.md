---
name: uklad-odpowiedzi-zespol
description: Układ odpowiedzi końcowej dla zespołu ELMI i ATERIMA (linia ▶, zadania, pytania, szkic maila). Stosuj w każdej odpowiedzi końcowej po wykonaniu pracy, w Claude Code i w czacie.
---

# Układ odpowiedzi końcowej

Odpowiedź po wykonanej pracy ma stały układ, żeby rozmówca od razu widział, co się stało i czego od niego potrzeba. Gdy w aplikacji działa mod „wyglad”, narysuje z tego ramki i przyciski; bez niego układ czyta się jako zwykły tekst.

1. **Pierwsza linia: `▶ ` i jedno zdanie, co się stało** (wynik, nie opis pracy). Pisz prostym językiem, bez skrótów i nazw plików, od tego, co najważniejsze.
2. **Wyjaśnienie** w krótkich punktach „- ”: jeden punkt to jedna rzecz, najwyżej trzy zdania. W każdym punkcie jedno pogrubione zdanie, które niesie sens punktu. Nie pogrubiaj nic więcej.
3. **Sekcje** rozdzielone linią `---`, tylko te, które występują:
   - `**Zrobione**` – co jest gotowe i jak to sprawdzono;
   - `**Nie udało się**` – co próbowano i się nie powiodło;
   - `**Niewyjaśnione**` – czego jeszcze nie wiesz i sprawdzasz;
   - `**Zadania dla Ciebie**` – tylko czynności, które rozmówca ma wykonać sam i które nie wymagają wyboru;
   - `**Pytania do Ciebie**` – decyzje i wybory.
4. **Zadania:** lista numerowana od 1: „1. Co zrobić – wyjaśnienie w jednym lub dwóch zdaniach: po co i co się stanie bez tego.” Jedno zadanie to jeden cel; kilka czynności po kolei do jednego celu to wcięte kroki „   a) …”, „   b) …”. Rozmówca odpisuje „1 zrobiłem”.
5. **Pytania:** „**1. Pytanie?**”, linia „Dlaczego to ważne: …”, potem każda opcja w osobnej linii „- **A)** co się stanie – plus: …; minus: …”, na końcu „➜ Polecam 1B, bo …”. Rozmówca odpisuje „1B”. Decyzje idą zawsze do pytań, nigdy do zadań.
6. **Pokaż to, o co pytasz.** Prosisz o ocenę albo wybór czegoś, co da się zobaczyć (tekst, mail, wygląd, grafika)? W tej samej odpowiedzi pokaż to, a przy kilku opcjach każdą osobno. Nie pytaj o numery opcji, których rozmówca nie widzi.
7. **Szkic maila lub wiadomości** zawsze w bloku oznaczonym `mail`: linie „Od:”, „Do:”, opcjonalnie „DW:”, „Temat:”, pusta linia i sama treść, dokładnie tak, jak ma pójść. Mail wysyłasz dopiero po wyraźnym „wyślij” rozmówcy.
8. **Linki:** każdy adres i plik jako `[krótka nazwa](adres)`, nigdy goły adres. Ścieżkę ze spacją weź w nawiasy ostre: `[nazwa](<C:\Folder ze spacją\plik.docx>)`.
9. **Krótko.** Co nie jest potrzebne do decyzji, zostaw, aż rozmówca dopyta.
10. **Odpowiedź na pytanie albo zwykła rozmowa** (bez wykonanej pracy) nie potrzebuje tego układu: odpowiedz po prostu.
11. **Bloki z ikonami w czacie i Cowork.** Gdy nie ma moda „wyglad”, a w czacie jest narzędzie do wizualizacji, wyjaśnienie, pytania, zadania i stany rysuj w jednym obrazie jako bloki z zaokrąglonymi rogami i zabarwionym tłem, bez paska z boku, w tej kolejności: Wyjaśnienie (jasnoszare, ikona `ti-info-circle`), Czeka na Ciebie · decyzja (pomarańczowe, `ti-help-circle`, przyciski opcji wysyłające odpowiedź przez `sendPrompt`, pod nimi linia „Przycisk nie działa? Napisz 1A albo 1B.”), Czeka na Ciebie · zadanie (niebieskie, `ti-hand-finger`, kroki K1A, K1B), Nie udało się (czerwone, każdy punkt z `ti-lock` „Brak uprawnień: …” albo `ti-x` „Nie udało się: …”), Jeszcze sprawdzam (szare, `ti-search`), Czeka na innych (szare, `ti-hourglass`, punkty z `ti-user` i imieniem), Zrobione (zielone, `ti-circle-check`, punkty z `ti-check`). W kolorze bloku tylko ikona i mała etykieta, tekst do czytania w zwykłym kolorze. Kolory tylko ze zmiennych motywu, żeby działały w jasnym i ciemnym motywie. Pod obrazem tylko linia ▶ i zdanie, czego potrzebujesz; bloków nie powtarzaj tekstem.
