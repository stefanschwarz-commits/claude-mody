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
| 2026-10-09 | wyglad 0.18.3: podpunkty w Podsumowaniu wcięte pod numerowanym punktem | Zrzut: podpunkty wyglądały jak osobna lista |
| 2026-10-09 | wyglad 0.19.0: „Problem” zastąpione przez „Nie udało się” (czerwona) i „Niewyjaśnione” (pomarańczowa); cztery sekcje podsumowania w osobnych kolorowych ramkach z tytułem w środku; punkt: pogrubiony początek, reszta szarym; stare „Problem” nadal rozpoznawane | Stefan: „Problem” niejasny (1A); ściana tekstu w podsumowaniu; inspiracja stylem podglądów |
| 2026-10-09 | wyglad 0.19.1: blok do wklejenia (```) w sekcji zadań to jeden kawałek, nie lista kratek; licznik zadań zgodny z tym, co rysuje ramka; stare tabele zadań nadal liczone | Zrzut: cała instrukcja v6 wklejona w zadaniach zamieniła się w dziesiątki kratek |
| 2026-10-09 | wyglad 0.19.2: blok ``` pod sekcją zadań rysowany pod pomarańczową ramką jako zwykłe pole kodu (z przyciskiem kopiuj), ramka obejmuje tylko listę i zdanie pod nią | Uwaga sesji „Instrukcje dla Claude” po zrzucie Stefana |
| 2026-10-09 | wyglad 0.19.3: podpunkty i linki pod punktem podsumowania rysowane wewnątrz punktu bez wcięcia (4 spacje = pole kodu w Markdown) | Zrzut Stefana: podpunkt „Sprawdziłem…” i link wyświetlały się jako szare pola kodu z przyciskiem kopiuj |

## wyglad 0.19.4 (2026-10-10)
Podpowiedź dla Claude każe zaczynać odpowiedź końcową od linii `▶`. Dotąd zakładała, że ▶ już jest (z instrukcji globalnych), a bez ▶ mod nic nie rysuje. Stefan widział sesje bez ramek mimo restartu aplikacji.

## wyglad 0.19.5 (2026-10-10)
Sekcje rozpoznawane po samym nagłówku (🟢 **Zrobione** itd.), także bez linii `---` między nimi. Przegląd transkryptów pokazał, że w wielu sesjach Claude pisze ▶ i nagłówki, ale pomija `---`; mod dzielił tylko po `---`, więc rysował całość jako zwykły tekst. To była główna przyczyna „raz działa, raz nie”. Zdanie zaczynające się od „Zrobione…” nie otwiera sekcji (nagłówek = krótka linia bez kropki).

## wyglad 0.19.6 (2026-10-10)
Numer punktu w podsumowaniu i kratka przy zadaniu stoją przy pierwszej linii punktu (alignItems flex-start), nie na środku wysokości wielowierszowego tekstu. Zrzut Stefana z ramki „Zrobione” z 7 punktami po kilka linii.

## wyglad 0.19.7 (2026-10-10)
Pusta linia między punktami w ramkach podsumowania (gap), bo siedem kilkulinijkowych punktów bez odstępów robiło ścianę. Podpowiedź: pogrubiony początek punktu to wynik („Gira: bez nowych wydań.”), nie temat („Centrum Gira sprawdzone:”); liczby i daty zostają w wyjaśnieniu, nie w podsumowaniu. Stefan: „nie wiem do końca, co było zrobione, a co nie”.

## wyglad 0.19.8 (2026-10-11)
Szare rozwinięcie punktu podsumowania rysowane jako Markdown, nie zwykły tekst: link `[plik](plik)` był widoczny jako surowy zapis w nawiasach (zrzut z sesji „Granty UE”). Zrzut potwierdził też odstępy i numery przy pierwszej linii z 0.19.6–0.19.7.

## wyglad 0.20.0 (2026-10-11)
Stefan po zrzutach z 11.10:
- „Niewyjaśnione” ma fioletową ramkę i fioletowe tło (🟣), bo pomarańcz mylił się z „Do zrobienia przez Ciebie”.
- Zadania bez kratek, z numerami „1.”, „2.”: Stefan może odpisać „zrobiłem 1”, a kratek Claude i tak nie widzi (zaznaczenie zostaje w aplikacji). Kratki zostają tylko w panelu „Moje sprawy”.
- Zadanie rysowane jak punkt „Zrobione”: pogrubione „co zrobić (ile czasu)”, szare „po co” po myślniku. Podpowiedź mówi, że przed myślnikiem ma być samo działanie.
- Blok do wklejenia (```) w ramce podsumowania zostaje w całości i stoi pod ramką; dotąd rozpadał się na puste pola kodu z przyciskiem kopiowania i zwykły tekst.

## wyglad 0.21.0 (2026-10-11)
- Narzędzie `odhacz` dla Claude'a (numery zadań z ostatniej odpowiedzi, stan zrobione/odpada/otwarte): skreśla zadania w panelu „Moje sprawy”. Kratek Claude nie widzi, numery tak.
- Skrót Stefana „1 i 3 zrobiłem, 2 odpada”: mod dokleja do wiadomości (niewidocznie dla Stefana) treść zadań o tych numerach i prośbę o odhaczenie. Rozpoznawane słowa: zrobiłem/zrobione/gotowe/załatwione, odpada/pomijam/rezygnuję/nie zrobię.
- Linia stanu: „czeka: 2 zadania, 1 pytanie” po każdej odpowiedzi i po odhaczeniu.
- Kolory: „Do zrobienia przez Ciebie” niebieskie jak karty pytań (wszystko „od Ciebie” w jednej barwie, wariant A z makiety; Stefan nie wybrał jeszcze, zmiana to jedna linia), „Niewyjaśnione” wraca do pomarańczu (Stefan: żółty = „jeszcze nie wiemy”). Fiolet z 0.20.0 wycofany.
- Odłożone decyzją Stefana: blokada groźnych poleceń, lista wyboru w kartach. Następne: ikony SVG (Tabler, MIT) i kropki jako grafika, potem karty opcji obok siebie.

## wyglad 0.21.1 (2026-10-11)
Instrukcja v7 każe zaczynać zadania od „**Zadanie N:**”, bo wcześniejsza nakładka zamieniała numer na kratkę. Mod rysuje numer sam od 0.20.0, więc zdejmuje ten przedrostek z treści, żeby nie było „1. Zadanie 1:”. Pane „Moje sprawy” zostawia tekst bez zmian.

## Kolor ramki zadań (2026-10-11)
Stefan wybrał 1A: „Do zrobienia przez Ciebie” zostaje niebieskie, jak karty pytań (wszystko „od Ciebie” w jednej barwie). „Niewyjaśnione” pomarańczowe.

## wyglad 0.22.0 (2026-10-11)
Stefan wybrał 1B (ikony konturowe przy tytułach ramek) i 2A (wszystkie znaczki w tym samym stylu). Ikony z Tabler Icons 3.31.0 (MIT) wbudowane jako ścieżki SVG w hooks/icons.ts; kolor i rozmiar nadaje svgOf(). Gdzie: tytuły ramek (circle-check, circle-x, help-circle, list-check, message-question, info-circle), znacznik początku odpowiedzi (player-play), gwiazdka polecanej opcji (star) w linii opcji, kroki w tle (settings), kropka w pasku „Potrzebuję od Ciebie” (wypełnione kółko). Kolory ikon dobrane do motywu (jasny/ciemny). Na terminalu zostają dotychczasowe znaki, bo terminal nie rysuje SVG; o tym decyduje e.surface, nie tabela elementów (tabela terminala odpowiada na każdą nazwę pustym Box).
Nie zmienione: przyciski (☐ ☑ ↗ w panelu, „↑ Początek odpowiedzi”, „Wybierz 1A”) mają tylko etykiety tekstowe; z „Wybierz 1A ★” zdjęta gwiazdka, bo jest już ikoną w linii opcji.

## wyglad 0.22.1 (2026-10-11)
Stefan po zrzucie: woli białą gwiazdkę ★ z czcionki przy polecanej opcji („1A ★”) i na przycisku „Wybierz 1A ★”. Pomarańczowa ikona gwiazdki wycofana; reszta ikon z 0.22.0 zostaje.

## komputer 0.1.0 (2026-10-11)
Zlecenie od sesji „Oznaczanie lokalnych sesji Claude” (Stefan wybrał wariant z modem): tytuł każdej sesji lokalnej ma zaczynać się od „💻 ”. Mod hookuje klasyczne zdarzenia SessionStart i UserPromptSubmit, które niosą `session_title` i przyjmują `sessionTitle` w odpowiedzi. Lokalna = folder roboczy na dysku Windows (C:\…); chmura ma „/”. Dopisuje tylko brakujący znaczek, reszty tytułu nie rusza (dyspozytor szuka sesji po dokładnym tytule). Nowa sesja nie ma tytułu przy starcie, dostaje go od aplikacji po pierwszej wiadomości, więc znaczek pojawia się przy drugiej wiadomości; czy aplikacja nie nadpisze go potem i czy działa dla sesji z zadań zaplanowanych, do sprawdzenia w praktyce.

## wyglad 0.23.0 (2026-10-12)
Pomysł od sesji „Instrukcje dla Claude” (zrzut z sesji o planie KNX): w ramce zadań Claude wypisał „Pliki:” i dwa linki markdown do plików na komputerze, a mod policzył je jako zadania 2 i 3. Teraz: linia „Pliki:” znika, link do pliku na komputerze (ścieżka względna, C:\…, bez http) nie jest zadaniem, nie trafia do licznika ani do panelu „Moje sprawy”, a stoi pod ramką jako wiersz z ikoną pliku, nazwą i przyciskiem „Pokaż w folderze”. Przycisk woła narzędzie aplikacji reveal_path przez $.tool.call (na Windowsie aplikacja pyta o zgodę przy każdym użyciu). Na iPhonie zamiast przycisku napis „plik na komputerze, poproś o załącznik”. Linki do stron (http) bez zmian.

## wyglad 0.23.1 (2026-10-19)
Zgłoszenie Stefana (zrzut z konta ELMI) i sesji „Migracja NGO na konto Elmi”; Stefan: 1A, poprawić w modzie, nie wymuszać wzoru na sesjach. (1) „**Pytanie 1: …**” w treści jest rozpoznawane jako nagłówek pytania, karta nie dubluje „Pytanie 1:”. (2) Opcja „- **1A) ★ Tytuł.** reszta” (pogrubienie ciągnie się przez pierwsze zdanie) jest opcją z przyciskiem; tytuł zostaje pogrubiony. (3) Dopiski po opcjach („Na Twoją decyzję czekają też…”) zostają w karcie; przenoszenie ich pod kartę odłożone, bo nie wiadomo, czy to nie część pytania.
Dwa konta: mody są instalowane raz dla komputera, więc działają tak samo na obu; różnią się tylko instrukcje w Ustawieniach claude.ai (per konto). CLAUDE.md w repo opisuje wspólny tryb pracy dla sesji „Mody” na obu kontach. Polecenie dla konta ELMI (wklejenie instrukcji v7 i otwarcie sesji „💻 Mody”) w kolejce `_przeprowadzka-elmi/skrzynka/polecenia-dla-elmi/2026-10-19-1230-mody-instrukcje-i-sesja.md`.

## Dopisek (2026-10-19)
Sesja „Migracja NGO na konto Elmi” poprawiła polecenie w kolejce dla ELMI: wklejana ma być wersja 8 instrukcji (obowiązuje od 18.10, decyzja Stefana 2A), nie 7. Kolejki poleceń są teraz osobne dla każdego konta (polecenia-dla-elmi, -personal, -aterima) według reguły kolejka-polecen-miedzy-kontami.md.

## STAN: instrukcja w wersji 8 (2026-10-19)
Stefan „1A” w sesji „💻 Mody” na koncie ELMI: wiersz o instrukcji w STAN.md mówił o wersji 7. Poprawiony na wersję 8. Dopisane, że pole instrukcji w Ustawieniach claude.ai jest jedno dla profilu Stefana i wszystkie trzy konta mają tę samą treść (ustaliła sesja „Instrukcje dla Claude”, zapis w poleceniu `_przeprowadzka-elmi/skrzynka/polecenia-dla-elmi/wykonane/2026-10-19-1230-mody-instrukcje-i-sesja.md`). Kod modów bez zmian.

## Bez „Zadanie N:” w zadaniach; CLAUDE.md o jednych instrukcjach (2026-10-19)
Prośba sesji „Centralna dystrybucja maili”: numer przy polu ☐. Sprawdzone: w odpowiedzi nakładka rysuje numer od 0.20.0, a „Zadanie N:” ukrywa od 0.21.1; ☐ bez numeru są tylko w panelu „Moje sprawy”, gdzie numer z jednej odpowiedzi myliłby się z innymi. Stefan:
- „2A”: kodu nie zmieniamy; z reguły `~/.claude/rules/format-zadania-i-pytania.md` zdjęty wymóg „Zadanie N:” (punkt 2, punkt 4, uwaga na końcu). Zmiana instrukcji globalnej (v8 nadal każe pisać „Zadanie N:”) przekazana sesji „Instrukcje dla Claude” przez kolejkę Personal: `_przeprowadzka-elmi/skrzynka/polecenia-dla-personal/2026-10-19-1500-instrukcje-bez-zadanie-n.md`.
- „1A”: CLAUDE.md nie mówi już, że instrukcje wkleja się na każdym koncie osobno (pole jest jedno dla profilu Stefana).
