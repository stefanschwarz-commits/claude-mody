# DECYZJE

| Data | Decyzja | Powód |
| --- | --- | --- |
| 2026-10-08 | Dźwięk odtwarzany przez systemowy odtwarzacz (PowerShell na Windows, afplay na Macu), a nie wbudowane `$.audio.play` | `$.audio.play` na Windows nic nie gra |
| 2026-10-08 | Własne pliki WAV (miękki dzwonek) zamiast dźwięków systemu | ten sam, przyjemny dźwięk na Windows i Macu |
| 2026-10-08 | Drugi mod: pasek projektu + /stan (wariant A) | Stefan wybrał; przydaje się w każdej sesji |
| 2026-10-08 | Mod `wyglad` rozpoznaje odpowiedź końcową po znaku ▶, a komunikaty z trakcie pracy po długości (≤2 linie, bez ▶) | Silnik nie mówi, która wiadomość jest końcowa; format Stefana zawsze zaczyna odpowiedź od ▶ |
| 2026-10-08 | Przyciski odpowiedzi wpisują np. „1A” w pole, ale nie wysyłają | Stefan widzi i zatwierdza Enterem; nic nie wychodzi przez przypadkowe kliknięcie |
| 2026-10-09 | wyglad: zrobione = zielona ramka bez tytułu, problem = czerwona, zadania dla Stefana = pomarańczowa, pytania = niebieska | Zielony ma znaczyć „gotowe”; czerwień tylko dla problemów, żeby nie spowszedniała |
| 2026-10-09 | wyglad 0.3.0: jedna cienka ramka na sekcję, bez ramek w ramkach, podkreśleń, ikonek i tabel | Stefan: poprzednia wersja to „bałagan estetyczny” |
| 2026-10-09 | wyglad 0.4.0: opcje pytań w tabeli (Opcja / Co się stanie / Plus / Minus), przyciski z wierszy tabeli | Prośba Stefana: łatwiej porównać opcje |
| 2026-10-09 | wyglad 0.5.0: wariant C (najpierw „Potrzebuję od Ciebie”, reszta zwinięta), pasek-znacznik początku ostatniej odpowiedzi, pasek nad polem z przyciskiem do początku | Stefan nie wie, gdzie zaczyna się odpowiedź; wybrał C |
| 2026-10-09 | Pasek nad polem jest wspólny: projekt i wyglad rysują swoje linie i zostawiają miejsce innym modom | Pasek projektu zasłaniał pasek z przyciskiem do początku odpowiedzi |
| 2026-10-09 | wyglad 0.6.0: każde pytanie jako karta decyzji (pytanie, tabela opcji, rekomendacja, przyciski w jednej ramce); polecana opcja oznaczona „★ polecam” | Stefan nie widział pytania nad tabelą; wzorzec kart wyboru z systemów projektowania (Salt, SAP, Customer.io) |
| 2026-10-09 | wyglad 0.6.2: opcje w tabeli i w rekomendacji nazwane jak przyciski (1A, 1B, 2A…) | Stefan: w tabeli było samo „A”, a odpowiada się „1A” |
| 2026-10-09 | wyglad 0.7.0: status oznaczany kolorową kropką ● (zielona zrobione, czerwona problem, pomarańczowa zadania, niebieska pytania), tekst zwykły | Stefan: kropki podobają mu się bardziej niż kolorowy tekst; stała preferencja |
| 2026-10-09 | wyglad 0.9.0 (druga generacja): zwijanie kroków pracy, odhaczanie zadań, powiadomienie na koniec, zwijanie długich wyjaśnień, panel „Moje sprawy” | Wybór Stefana z katalogu efektów; powiadomienie na próbę |
| 2026-10-09 | wyglad 0.9.1: rozpoznaje nagłówki z kropkami 🟢🔴🟠🔵⚪ (instrukcja v6) i „Polecam 1B” z numerem | Zgodność z instrukcją v6; gwiazdka znikała przy numerowanej rekomendacji |
| 2026-10-09 | wyglad 0.10.0: opcje pytań bez tabeli (jedna linia na opcję, 1A/1B, ★ przy polecanej), przyciski „Wybierz 1A”, odstęp pod paskiem ▶ | Stefan: tabela utrudniała zamiast ułatwiać |
| 2026-10-09 | Folder roboczy modów: C:\Projekty\claude-mody (własna kopia repozytorium), nie OneDrive ani ukryta kopia Claude Code | Ukrytą kopię program nadpisuje przy aktualizacji; OneDrive psuje repozytoria; tak samo jak strony w C:\Projekty |
| 2026-10-09 | wyglad 0.11.0: delikatne niebieskie tło w kartach pytań (jasne albo ciemne według motywu) | Prośba Stefana |
| 2026-10-09 | wyglad 0.12.0: zadania w ramce z delikatnym pomarańczowym tłem; numer opcji i gwiazdka w jednej linii z treścią; podwójne gwiazdki usuwane | Prośba Stefana i usterki ze zrzutu |
| 2026-10-09 | wyglad 0.13.0: panel „Moje sprawy” pokazuje treść opcji pytań; pasek nad polem w jednej linii (bez powtórzonego wniosku). projekt 0.1.2: bez STAN.md pasek projektu się nie pokazuje | Stefan: same przyciski „Wybierz 1A” nic nie mówią; trzy linie nad polem to za dużo |
| 2026-10-09 | wyglad 0.14.0: przy zadaniach sama kratka (bez kropki); Zrobione, Problem i Dla informacji widoczne w całości, zwijane dopiero powyżej 15 linii | Stefan: kratki z kropkami to chaos; „szczegóły” są często dla niego istotne |
| 2026-10-09 | wyglad 0.15.0: znacznik ostatniej odpowiedzi jasny i neutralny zamiast pomarańczowego, starsze odpowiedzi z szarą linią; długie wyjaśnienia zwijane dopiero powyżej 30 linii, nigdy w środku tabeli | Stefan: jasna linia nie bije po oczach, za dużo kolorów; tabela ucięta w połowie |
| 2026-10-09 | wyglad 0.15.1: w panelu „Moje sprawy” opcje pytań jedna pod drugą, przyciski osobno | Opcje stały w wąskich kolumnach obok przycisków i tekst się rozsypywał |
| 2026-10-09 | wyglad 0.16.0: tytuł „Do zrobienia przez Ciebie” wewnątrz pomarańczowej ramki; Zrobione/Problem/Dla informacji we własnej szarej ramce „Podsumowanie” | Stefan: tytuł poza ramką — nie wiadomo, czego ramka dotyczy; podsumowanie poza ramkami nieczytelne |
| 2026-10-09 | wyglad 0.16.1: przyciski odpowiedzi przechodzą do nowej linii, gdy brakuje miejsca (panel i karty) | W wąskim panelu trzeci przycisk był ucięty |
| 2026-10-09 | wyglad 0.17.0: panel „Moje sprawy” jako spis (jedna linia na sprawę, ☐ i ↗ do pełnej treści w odpowiedzi, bez opcji i przycisków Wybierz); bez kropek w tytułach ramek | Stefan: panel był zatłoczony, kolor ramki wystarcza zamiast kropki |
| 2026-10-09 | wyglad 0.18.0: w „Podsumowaniu” punkty numerowane (1., 2., …) zamiast kropek, kolorowa kropka tylko przy nagłówku sekcji; delikatne szare tło ramki | Stefan: za dużo kropek; lubi tabele i delikatne tła |
| 2026-10-09 | wyglad 0.18.1: pasek nie pisze „Nic od Ciebie nie potrzebuję”, gdy odpowiedź nie ma sekcji; zwijanie dopiero powyżej 40 linii i nigdy zaraz po nagłówku | Zrzut z sesji CodeTwo: 6 spraw dla Stefana, a pasek twierdził, że nic; „Zrobię sam:” z pustą listą |
| 2026-10-09 | Tabele porównawcze: ✓ tak, ✗ nie, ~ częściowo, ? nie wiadomo; kropki tylko dla statusu sprawy (mod 0.18.2 i instrukcja v6) | Stefan: kropki „tak/nie” w tabeli to zły standard |
