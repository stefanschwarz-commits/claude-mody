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


## wyglad 0.23.2 (2026-10-20)
Stefan w sesji „💻 Laptopy zespołu”: „to strasznie wygląda”. Przyczyna: krótka odpowiedź końcowa bez ▶ (jedno-dwa zdania) mod brał za komunikat z trakcie pracy i rysował jako szarą, pochyłą linię „· …”. Teraz mod zapamiętuje tekst odpowiedzi końcowej z `turn.complete` i taka odpowiedź zostaje w zwykłym wyglądzie; komunikaty w trakcie pracy dalej się zwijają. Nowy test.
Ustalenie przy okazji: w tej sesji (założonej przez inną sesję w aplikacji) w kontekście Claude nie było podpowiedzi moda z `prompt.compose` („Każdą odpowiedź końcową zaczynaj od linii ▶”), ani instrukcji globalnych z claude.ai; docierają reguły z `~/.claude/rules`. To prawdopodobnie główny powód sesji bez ramek. Czy dopisać układ odpowiedzi do reguły w `~/.claude/rules`, decyduje Stefan.
Stefan wybrał 1A: układ odpowiedzi (▶ i nagłówki sekcji, odsyłacz do najnowszej instrukcji globalnej) zapisany jako reguła `~/.claude/rules/uklad-odpowiedzi.md`, bo reguły docierają do każdej sesji na komputerze. Przy nowej wersji instrukcji sesja „Instrukcje dla Claude” poprawia też tę regułę (polecenie w kolejce Personal).
## Obejście: wtyczka bezpieczeństwa pomija hooki modów na koncie ELMI (2026-10-20)
Od Claude 2.1.304 wbudowana wtyczka `cc-plugin-sec-default@builtin` na planach Team/Enterprise siada najwyżej w łańcuchu i przy `prompt.compose`, `classic.SessionStart` i `classic.UserPromptSubmit` puszcza zdarzenie dalej z pominięciem poziomu `user` (komunikat „its … hook was skipped. "cc-plugin-sec-default" runs first and sent the event on past it.”). Ustawienie `prependPlugins` w ustawieniach osobistych jest na planach firmowych ignorowane. Skutek: na ELMI brak podpowiedzi moda o układzie odpowiedzi (źle rysowane ramki) i brak znaczka 💻 w tytułach nowych sesji. Stefan:
- „1A”: tekst SECTIONS z `plugins/wyglad/hooks/register.tsx` także jako reguła `~/.claude/rules/wyglad-uklad-odpowiedzi.md` (reguły docierają zawsze). Przy zmianie SECTIONS poprawić też regułę.
- „2A”: znaczek 💻 także zwykłym hookiem z ustawień: `~/.claude/hooks/znaczek-komputer.js` w `~/.claude/settings.json` (SessionStart, UserPromptSubmit, `hookSpecificOutput.sessionTitle`); hooki z ustawień uruchamia rdzeń, za wtyczką bezpieczeństwa. Gdy mod też działa (Personal), oba dają ten sam tytuł.
Mody bez zmian; obejścia można zdjąć, gdy Anthropic to poprawi.

## Kółeczko „◦” za tytułem sesji otwartych przez Claude; komputer 0.1.1 (2026-10-20)
Stefan „1A”: sesje otwarte automatycznie (przez inną sesję, zadanie zaplanowane, harmonogram Windows) mają subtelne „ ◦” na końcu tytułu, żeby odróżnić je od otwartych ręcznie. Robi to hook z ustawień `~/.claude/hooks/znaczek-komputer.js`: rozpoznaje pierwszą wiadomość (nagłówek „Background (from the session that started this one)”, „Linked sessions now”, `<scheduled-task`, „Przebieg uruchomiony przez harmonogram Windows”), zapamiętuje id sesji w `~/.claude/hooks/sesje-otwarte-przez-claude.txt`; kółeczko pojawia się od drugiej wiadomości (tytuł nadaje aplikacja po pierwszej). Dyspozytor i doręczyciel poczty (`~/.claude/scheduled-tasks/dyspozytor-poczty*`, `doreczyciel-poczty-elmi`, kopie `.bak-20261020-kolko`) pomijają końcowe „ ◦” przy szukaniu sesji po dokładnym tytule.
komputer 0.1.1: mod nie nadpisuje tytułu, który ustawił już hook z ustawień (inaczej na Personal zdejmowałby kółeczko).

## wyglad 0.24.0, komputer 0.2.0: bez hooków pomijanych przez wtyczkę bezpieczeństwa (2026-10-20)
Stefan: „zdejmij z modów hooki zastąpione obejściami, żeby szare linie zniknęły”. Każde pominięcie hooka modu przez `cc-plugin-sec-default` dawało w każdej sesji na ELMI szarą linię „its … hook was skipped”. wyglad: zdjęty `prompt.compose` i stała SECTIONS; układ odpowiedzi jest tylko w regule `~/.claude/rules/wyglad-uklad-odpowiedzi.md` (to teraz jedyne źródło; `/wyglad off` wyłącza już tylko rysowanie). komputer: zdjęte `classic.SessionStart` i `classic.UserPromptSubmit`; znaczek 💻 i kółeczko ◦ robi tylko hook z ustawień `~/.claude/hooks/znaczek-komputer.js`. Gdy Anthropic poprawi wtyczkę, można wrócić do hooków w modach.

Zmiana do wpisu o regule `uklad-odpowiedzi.md` (2026-10-20, sesja „💻 Laptopy zespołu”): w tej samej chwili sesja „Mody” zapisała `wyglad-uklad-odpowiedzi.md`; reguły różniły się przy gwiazdce ★. Stefan: „1A”, zostaje tylko `wyglad-uklad-odpowiedzi.md`. `uklad-odpowiedzi.md` usunięta, polecenie w kolejce Personal wycofane (nie zostało wykonane).
## Kółeczko ◦ dopisane wstecz (2026-10-20)
Stefan: „dopisz wstecz … na wszystkich sesjach założonych automatycznie”. Na koncie ELMI 28 niezarchiwizowanych sesji: kółeczko dostało 25, czyli wszystkie z `parentSessionId` (otwarte przez inną sesję) albo `scheduledTaskId` (zadanie zaplanowane); ręczne zostały bez zmian: „💻 ELMC.EU”, „💻 Przeprowadzka”, „💻 Test”. „Przejęcie rejestru na koncie ELMI” dostało też 💻. Sesje konta Personal i zarchiwizowane nie są stąd widoczne, więc ich nie ruszano.

## wyglad 0.24.1: zadanie bez myślnika pogrubione tylko w pierwszym zdaniu (2026-10-22)
Zrzut Stefana (sesja o karcie Google Cloud na ELMI): zadanie „Usuń starą kartę (minuta). Na otwartej karcie …” nie miało myślnika, więc mod pogrubiał cały, kilkuwierszowy tekst. Teraz bez myślnika pogrubione jest pierwsze zdanie (co zrobić), reszta szara jak „po co”. Test dopisany.

## wyglad 0.25.0: szkic maila jako karta „Szkic maila” (2026-10-22)
Stefan: proponowane treści maili mają być wyraźne, „żebym wiedział, co jest treścią maila, a co nie”; wybrał 1A (karta jak kartka papieru z przyciskiem kopiowania). Zapis w odpowiedzi: blok ```mail z liniami „Do:”, „DW:”, „Załącznik:”, „Temat:”, pustą linią i treścią (reguła `~/.claude/rules/wyglad-uklad-odpowiedzi.md`, akapit „Szkic maila”). Mod wyjmuje taki blok z wyjaśnienia i rysuje pod nim jasną kartę (to samo jasne tło w obu motywach, ikona koperty Tabler `mail`), nagłówki osobno, „Temat” pogrubiony, pod spodem przycisk „Kopiuj treść” ($.ui.copy, sama treść bez nagłówków; przy niepowodzeniu komunikat „zaznacz treść myszą”). Testy w `hooks/mail.test.ts`.

## README dla innych sesji i kont: jedyne źródło modów (2026-10-22)
Stefan chce, żeby sesje na innych kontach wiedziały, skąd brać mody, i żeby mody były identyczne na wszystkich kontach. Mody żyją na komputerze (`~/.claude/plugins`), nie na koncie claude.ai, więc na jednym komputerze są już wspólne; wspólnym punktem odniesienia dla każdej sesji jest to repozytorium (CLAUDE.md mówi to sesjom pracującym w repozytorium, README mówi to sesjom z zewnątrz). README dostał sekcję: gdzie są mody, instalacja i aktualizacja na nowym komputerze (wszystkie cztery mody), zasady dla sesji oraz akapit do wklejenia raz w polu instrukcji claude.ai (pole jest wspólne dla Personal, ELMI i ATERIMA SERVICES).

## Repozytorium claude-mody publiczne (2026-10-22)
Stefan wybrał 1A: repozytorium z modami ma być publiczne, żeby każde konto i każdy komputer instalowały mody bez logowania do GitHuba. W modach nie ma haseł ani danych firmowych (sprawdzone). Przełączenia nie da się zrobić z sesji w chmurze (łącze do GitHuba blokuje zmiany ustawień repozytorium), więc robi je Stefan w ustawieniach repozytorium na GitHubie.

## wyglad 0.26.0: linki w pogrubionych początkach klikalne (2026-10-29)
Zgłoszenie z sesji „Napisz politykę prywatności Akademii Opiekunów”, słowa Stefana: „Nigdy nie dawaj mi linków w postaci tekstu, który nie jest linkiem… wystarczy raz kliknąć”. Pogrubiony początek zadania (część przed myślnikiem), początek punktu podsumowania i tytuł karty pytania były rysowane jako zwykły tekst, więc adres albo [nazwa](adres) w tych miejscach był martwym napisem. Teraz te trzy miejsca idą przez Markdown w pogrubieniu, więc link jest klikalny. Test w `hooks/linki.test.ts`; wspólne pomocniki testów w `hooks/drzewo.ts` (bolds, markdowns), bo stare testy szukały pogrubień jako Text. Propozycja tamtej sesji, żeby dopisać do reguły układu odpowiedzi zdanie „każdy adres jako [krótka nazwa](pełny adres), nigdy goły ani w kodzie”, czeka na decyzję Stefana (reguła leży w ~/.claude/rules, poza repozytorium).

## wyglad 0.26.1: żadnego surowego zapisu linku nigdzie (2026-10-29)
Zrzut Stefana: nagłówek odpowiedzi pod „Nowa odpowiedź” pokazywał [nazwa](adres) jako goły tekst; Stefan: „Tego rodzaju pokazywanie linków musi się natychmiast skończyć”. Przegląd wszystkich miejsc, w których mod rysował tekst odpowiedzi jako Text: nagłówek ▶ i wskazówka „➜ Polecam” idą przez Markdown w pogrubieniu (link klikalny); miejsca jednowierszowe, które nie mogą narysować linku (panel „Moje sprawy”, skreślone zadanie, zwinięty skrót sekcji), pokazują samą nazwę linku zamiast nawiasów (plainOf). Test nagłówka w `hooks/linki.test.ts`.

## wyglad 0.26.2: gołe ścieżki obok adresu stają się linkami (2026-10-31)
Zrzut Stefana (sesja Akademii): „Strony do obejrzenia: https://akademiaopiekunow.pl/dyzury-ekspertow/ · /jak-pracuja-eksperci/ · /kontakt/” – tylko pierwszy adres był linkiem, reszta to ścieżki wpisane skrótowo przez sesję. Stefan: „Chyba nie muszę tłumaczyć, gdzie jest problem”. Mod dopełnia teraz każdą gołą ścieżkę (/coś/) adresem z pierwszego pełnego linku w tej samej linii i rysuje ją jako link (linkPaths w split.ts, przed podziałem odpowiedzi; bloki kodu pominięte). Zdanie w regule układu odpowiedzi („każdy adres jako odnośnik”) nadal czeka na decyzję Stefana.

## Reguła o linkach w układzie odpowiedzi (2026-10-31)
Stefan wybrał 1A: do `~/.claude/rules/wyglad-uklad-odpowiedzi.md` dopisany akapit „Linki”: każdy adres jako odnośnik [krótka nazwa](pełny adres), nigdy goły tekst, skrócona ścieżka ani kod; dotyczy nagłówka ▶, zadań, pytań i punktów podsumowania; plik na komputerze też jako odnośnik (mod rysuje „Pokaż w folderze”). Reguła leży poza repozytorium (per komputer); tu tylko zapis decyzji.

## wyglad 0.27.0: dymek Windows przy pytaniu, podpowiedzi „1A”, wiersz pracy po polsku (2026-11-01)
Przegląd nowości silnika modów z ostatniego miesiąca (typy API w skillu plugin-authoring, dziennik zmian Claude Code). Stefan: powiadomienia „na pewno chciałbym to wdrożyć”, ale tylko gdy „sekcja się zatrzymuje, ponieważ nie ma odpowiedzi na moje pytania”; podpowiedzi przy pisaniu „chciałbym je włączyć”; kółko ładowania „spróbujmy”. Ustalenia:
- Powiadomienie tylko przy odpowiedzi z sekcją „Pytania do Ciebie” (nie przy samych zadaniach, nie przy zwykłym końcu pracy). `$.ui.notify` silnika działa tylko w terminalach (aplikacja desktopowa odpowiada `no-surface`), więc mod najpierw próbuje nim, a gdy nic nie poszło, rysuje dymek Windows przez PowerShell (WinRT ToastNotification, XML przez stdin). Tytuł: „Claude czeka na Twoją odpowiedź · <folder sesji>” (mod nie zna tytułu sesji; hooki klasyczne są pomijane na ELMI), treść: nagłówek ▶ i liczba pytań. Wyłącza się razem z `/wyglad off`.
- Podpowiedzi (`prompt.autocomplete`): po wpisaniu cyfry pole wpisywania podsuwa nazwy przycisków ostatniej odpowiedzi („1A”, „1B”) i „N zrobiłem” dla jej zadań. Czy aplikacja desktopowa rysuje te wiersze, do potwierdzenia przez Stefana.
- Wiersz pracy (`Spinner`): słowo po polsku według trybu tury (Myślę / Pytam model / Pracuję / Piszę odpowiedź).
Testy w `hooks/powiadomienia.test.ts`. Odłożone, czekają na decyzje Stefana: twarda blokada narzędzi (Stefan: „tak, ale naprawdę niebezpiecznych i nieodwracalnych” – lista do ustalenia), ochrona listy spraw przy kompresji rozmowy, rozpoznawanie „zrobiłem” małym modelem; rozmiar tekstu w ramkach – Stefan wybrał 1C: najpierw próbka obu wersji ze zrzutami.

## wyglad 0.27.0 (ciąg dalszy) i straznik 0.1.0: stare zadania, pasek odpowiedzi, kompresja, twarda blokada (2026-11-01)
Dalsze decyzje Stefana z tej samej rozmowy:
- Stare zadania (prośba sesji „💻 Migracja NGO na konto Elmi”: Stefan użył nieważnego kodu logowania ze starszej ramki). Stefan wybrał 1A: ramka zadań odpowiedzi, po której jest już nowsza odpowiedź z zapisem w sprawach, dostaje szarą linię „Starsza odpowiedź: aktualne zadania są w najnowszej odpowiedzi niżej” i przygaszone zadania; narzędzie `odhacz` przyjmuje `tekst` (fragment treści zadania z dowolnej odpowiedzi) i stan `nieaktualne` (skreślone jako „zastąpione”, także w panelu). Opis narzędzia każe Claude unieważnić stare zadanie, gdy daje nowe w jego miejsce. Terminy ważności zadań odrzucone (działałyby tylko, gdy sesja dopisze termin). Test `hooks/stare-zadania.test.ts`.
- Pasek „Nowa odpowiedź” (Stefan: trójkącik „nie sprawdza się”, chce daty, godziny i sekund oraz numeru odpowiedzi): pasek mówi „Odpowiedź N · d.m.rrrr, gg:mm:ss” z dopiskiem „najnowsza”; starsze odpowiedzi mają szary „Odpowiedź N · gg:mm:ss” (data tylko z innego dnia). Numer i czas zapisywane przy końcu tury (`stamps`). Ikona ▶ z paska usunięta.
- Kompresja rozmowy (Stefan: „Włączamy… zajebiste”): hook `session.compact` dopisuje streszczaczowi otwarte zadania i pytania ostatniej odpowiedzi z ich numerami i nazwami opcji, żeby „1 zrobiłem” i „1A” działały po streszczeniu.
- Twarda blokada (Stefan: „tak, ale naprawdę niebezpiecznych i nieodwracalnych”, potem 1A z zastrzeżeniem: wysyłka tylko „gdy wysyłasz to jako ja”, nie jako Czesiek ani Claude Kowalski): nowy mod `straznik`. Hook `tool.check` zamienia w pytanie do człowieka wysyłkę przez konektor Microsoft 365 zalogowany na Stefana (outlook_send_mail, send_draft, forward_mail, teams_send_*, teams_create_chat) i trwałe usuwanie (delete_session, sharepoint_delete_item, outlook_batch_delete_messages). Pytanie zrobione przez hook zatwierdza wyłącznie osoba w okienku (nie tryb auto, nie zapisana reguła); gdzie nikogo nie można spytać, jest odmowa. Archiwizacja sesji i polecenia rm celowo poza listą (1A). Czesiek (Power Automate, Graph czesiek@) i Claude Kowalski (skrypt strony) nie idą przez te narzędzia, więc nie są blokowani.
- Powiadomienia aplikacji: Stefan wybrał 2A – wyłączone wbudowane dymki „sesja skończyła pracę” (ustawienie aplikacji, zmienione narzędziem ustawień), zostają dymki aplikacji o pytaniu w okienku i o zgodzie na narzędzie oraz dymek moda przy pytaniach. Czytanie na głos: 3B, nie.


## wyglad 0.27.1 (2026-11-01)
Tylko numer wersji: dwa wydania tego dnia miały ten sam numer 0.27.0, więc instalator nie pobrał drugiego (stare ramki, pasek z czasem, kompresja). Nauczka: każdy commit z kodem moda podbija wersję.

## wyglad 0.28.0: zadania i pytania rozdzielone, pytania numerowane narastająco (2026-11-01)
Zgłoszenie sesji „💻 Migracja NGO na konto Elmi”, słowa Stefana: „Należy odróżnić zadanie od pytania… zadania i pytania powinny mieć różne kolory.” Obie ramki były niebieskie i obie zaczynały od 1, Stefan odpowiadał o zadaniu, gdy chodziło o pytanie. Stefan wybrał wariant A i doprecyzował nazwy („Zadanie jeden, Zadanie dwa, adekwatnie do Pytanie jeden”):
- ramka zadań nazywa się „Zadania dla Ciebie”, zostaje niebieska, numery rysowane jako „Zadanie 1”, „Zadanie 2”; stary nagłówek „Do zrobienia przez Ciebie” nadal rozpoznawany;
- karty pytań są fioletowe (nowy odcień `violet` w Ink i tint), tytuł „Pytanie N”;
- na prośbę Stefana („mam już wiele pytań oznaczonych numerem jeden”) pytania numerowane narastająco w całej rozmowie: mod pamięta w `stamps` liczbę pytań poprzednich odpowiedzi (`qBase`) i rysuje „Pytanie 7”, opcje „7A/7B”, przyciski „Wybierz 7B”, wskazówkę „Polecam 7B”; Claude nadal pisze od 1 w każdej odpowiedzi, a gdy Stefan napisze „7B”, prompt.submit dokłada notatkę „7B: Pytanie 1 z Twojej ostatniej odpowiedzi, opcja B”. Panel „Moje sprawy” i streszczenie przy kompresji używają numerów narastających. Zadania zostają numerowane od 1 w każdej odpowiedzi (skrót „1 zrobiłem” bez zmian).
- Reguły poza repozytorium poprawione w tej samej odpowiedzi: `~/.claude/rules/wyglad-uklad-odpowiedzi.md` (nagłówki 🔵 Zadania dla Ciebie / 🟣 Pytania do Ciebie, opis numeracji) i `format-zadania-i-pytania.md` (nazwa ramki).
Testy w `hooks/stare-zadania.test.ts` (numeracja, notatka „2B”) i poprawione asercje „Zadanie N” w starszych testach.

## wyglad 0.28.1: ramka „Pytania do Ciebie” tej samej formy co zadań, żółta zamiast fioletu (2026-11-01)
Stefan: „Jeśli chcesz utworzyć sekcję pod tytułem »Zadania dla Ciebie«, dodaj również odpowiednik: »Pytania do Ciebie«. Zadania i pytania to dwie formy Twojej interakcji ze mną. Powinny być podobne pod względem formy graficznej, ale mieć inny kolor.” oraz „zamiast fioletowego koloru wolałbym żółty lub pomarańczowy”. Pomarańczowy jest zajęty przez „Niewyjaśnione” (decyzja z 2026-10-19), więc pytania są żółte (`yellow` w Ink i tint, w obu motywach). Osobne karty pytań zastąpione jedną żółtą ramką z tytułem „Pytania do Ciebie” i blokami „Pytanie N” w środku, tak jak ramka zadań ma tytuł i wiersze „Zadanie N”. Reguła układu odpowiedzi: nagłówek pytań 🟡.

## wyglad 0.28.2: nieaktualne pytania też przygaszone, odpowiedziane bez przycisków (2026-11-01)
Stefan: „Skoro możesz w starszych wątkach wyszarzać nieaktualne pytania i zadania, i robisz to chyba teraz tylko z zadaniami, czy możesz też wyszarzać nieaktualne pytania?” Zrobione dwojako: (1) ramka pytań odpowiedzi, po której jest nowsza, dostaje linię „Starsza odpowiedź: aktualne pytania są w najnowszej odpowiedzi niżej”, pytania i opcje przygaszone, przyciski schowane; (2) gdy Stefan odpowie („7B”), hook prompt.submit zapisuje wybór w `answered`, a pytanie rysuje się odtąd jako jedna przygaszona linia „Pytanie 7: … · odpowiedziałeś 7B”, bez opcji i przycisków, i znika z listy pytań w panelu „Moje sprawy”. „Starszą” odpowiedź rozpoznaje teraz jej zapis w `stamps` (nie w sprawach), bo sprawy trzymają pytania tylko ostatniej odpowiedzi.

## wyglad 0.28.3: pogrubienie urwane w zdaniu, i reguła „co to zmienia dla Stefana” (2026-11-01)
Zrzut Stefana z ramki Zrobione: „**Ustawienia na trzech kontach są zgodne ze wspólną wersją**, a WhatsApp…” rysowało się jako pogrubiona linia i szara linia zaczynająca się od przecinka. Mod: gdy po pogrubieniu stoi przecinek, średnik, dwukropek albo myślnik, pogrubiony początek ciągnie się do końca tego zdania, a szara część zaczyna od następnego zdania (test w register.test.ts). Reguła układu odpowiedzi: pogrubienie kończy się razem ze zdaniem.
Stefan o treści punktów („Jest to tak skrócone, że jeśli nie pracowałem w danym wątku przez chwilę, w ogóle nie rozumiem, o co chodzi… Co to oznacza? Co to dla mnie znaczy? Jaki problem rozwiązuje?”): reguła układu odpowiedzi każe po pogrubionym wyniku napisać jedno lub dwa zdania o tym, co to zmienia dla Stefana i jaki problem rozwiązuje, dla kogoś, kto nie śledził wątku, bez skrótów i nazw plików. To zmiana w pisaniu, nie w modzie.

## wyglad 0.28.4: „Pokaż szczegóły” w ramce, której dotyczy (2026-11-01)
Stefan (zrzut ramki Zrobione z przyciskiem pod spodem): „Czy »Pokaż szczegóły« mogłoby być wyświetlane wewnątrz ramki, której dotyczy?” Przycisk rysuje się teraz na dole każdej zwiniętej ramki podsumowania (Zrobione, Nie udało się, Niewyjaśnione, Dla informacji), zamiast raz pod wszystkimi. Jedno kliknięcie nadal rozwija wszystkie ramki tej odpowiedzi (wspólny stan `isFull`), bo długa jest zwykle cała odpowiedź, nie jedna ramka.

## wyglad 0.29.0: zwinięte podsumowanie z wynikami, pytania morskie i każde w swojej ramce (2026-11-01)
- Stefan: „Czy przycisk »Pokaż szczegóły« mógłby rozwijać dodatkowe wyjaśnienia do punktów, które już zostały zrobione, zamiast je zwijać?” Zwinięta ramka podsumowania pokazuje teraz pogrubione wyniki wszystkich punktów, a „Pokaż szczegóły” (w ramce) dokłada pod nimi szare wyjaśnienia i podpunkty; stare „jedna linia streszczenia” zostało tylko dla ramek bez numerowanych punktów. Test w register.test.ts.
- Stefan o żółtej ramce pytań (zrzut): „ten kolor nie jest przyjemny… wymyśl jakiś kolor przyjemniejszy dla oka” i „czy każde pytanie nie mogłoby mieć swojej ramki?” Kolor pytań: morski/turkus (`teal`: ciemny motyw tło #122A2A, obrys #3cc1b5; jasny tło #E4F5F3, obrys #0f7f78), różny od niebieskich zadań i zielonego Zrobione. Każde pytanie ma własną ramkę wewnątrz sekcji „Pytania do Ciebie” (starsze i odpowiedziane: szary obrys). Reguła układu odpowiedzi: nagłówek pytań 🟢 (najbliższy kropce w tym kolorze). Do oceny Stefana po restarcie.

## wyglad 0.29.1: osobny przycisk na każdą ramkę podsumowania (2026-11-01)
Stefan (zrzut): „Oba przyciski działają jak jeden… te dwie ramki powinny być oddzielne i każda powinna mieć własny, niezależny przycisk. Natomiast jeden przycisk zwija obie ramki, tak że szarej w ogóle nie widać.” Stan otwarcia jest teraz na ramkę (`openFrames`, id „klucz odpowiedzi-numer ramki”) zamiast jednego `isFull` na odpowiedź, a ramka „Dla informacji” przy zwinięciu zostaje widoczna (zwinięta), zamiast znikać.

## wyglad 0.30.0: osobna ramka na każde zadanie i pytanie, bez tytułów sekcji, pytania piaskowe (2026-11-01)
Stefan doprecyzował: „każde pytanie i każde zadanie było przedstawione jako oddzielna tabela – nie jako jedna tabela zagnieżdżona w drugiej… Nie musisz tworzyć katalogu typu »zadania dla ciebie«, »pytania do ciebie«… zadania i pytania miały identyczną estetykę, logikę i treść… nie ma dwukropka, nie ma przerwy. Treść zadań nie powinna być szara… białą czcionką.” Oraz o kolorze: „Morski kolor nadal mi się nie podoba. Szukaj dalej przyjemnych barw, które są słabo widoczne i nie utrudniają czytania.”
- Każde zadanie: własna niebieska ramka „**Zadanie N: co zrobić (ile czasu)**” i pod spodem uzasadnienie zwykłą (nie szarą) czcionką; odhaczone: szary obrys, przekreślone. Każde pytanie: własna ramka tej samej formy „**Pytanie N: …**”. Wspólne tytuły „Zadania dla Ciebie” / „Pytania do Ciebie” nie są rysowane (w tekście odpowiedzi nagłówki zostają, bo po nich mod rozpoznaje sekcje). Linia „Starsza odpowiedź…” raz, nad ramkami.
- Kolor pytań: piaskowy, stonowany (`sand`: ciemny motyw tło #262320, obrys #b8ad98; jasny tło #F6F3EC, obrys #8a7f6a), żeby ramka była ledwo widoczna i nie przeszkadzała w czytaniu. Do oceny Stefana; w regule nagłówek pytań 🟤.
- Reguła: linków nie brać w cudzysłów (chip linku w aplikacji odstaje od cudzysłowu).
Testy dopasowane do „Zadanie N: …” w pogrubionym początku.

## wyglad 0.30.1: brak ▶ nie wyłącza ramek, gdy sekcje są znane (2026-11-01)
Stefan (zrzut sesji „Microsoft Cloud Admin przegląd”): „Dlaczego ta sesja ignoruje nasze mody?” Odpowiedź miała kolorowe nagłówki sekcji, ale zaczynała się od „Mam już pełny obraz…” zamiast od linii ▶, a mod rysował tylko po ▶. Teraz, gdy w odpowiedzi jest choć jeden znany nagłówek sekcji, a nie ma ▶, pierwsza niepusta linia staje się nagłówkiem i ramki są rysowane; zwykła proza bez sekcji nadal zostaje rysunkiem aplikacji. Test w register.test.ts.

## wyglad 0.30.2: ikony przy zadaniach i pytaniach, koniec „(minuta)” w zadaniach (2026-11-01)
Stefan (zrzut): „dodaj przed nimi ładną ikonkę… »Zrobione« ma już przyjemne »I«, a »zadanie jeden« go nie mają”; „Nie rozumiem, co oznacza »minuta«… »Nowe ramki ładują się przy starcie« to nie wyjaśnia nic.” Mod: ikona kwadratu (Tabler square) przed „Zadanie N”, kwadrat z ptaszkiem przy odhaczonym, dymek z pytajnikiem przed „Pytanie N”. Reguły (`wyglad-uklad-odpowiedzi.md`, `format-zadania-i-pytania.md`): zadanie bez szacunku czasu w nawiasie, po myślniku jedno lub dwa pełne zdania dla kogoś spoza wątku (co to znaczy, po co, co się stanie bez tego). Uwaga Stefana, że „to, co piszesz na początku… to kluczowe”, prowadzi do zakreślacza w wyjaśnieniu (decyzja 1B z tego dnia), następnego w kolejce.

## wyglad 0.30.3: wyjaśnienie zadania wielką literą (2026-11-01)
Stefan (zrzut „krzywej” ramki zadania): wyjaśnienie spod myślnika zaczynało się małą literą („nowa wersja wyglądu…”), bo w tekście odpowiedzi stoi po myślniku. Mod zaczyna je teraz wielką literą, bo w ramce jest osobnym zdaniem. Claude przestaje też dopisywać „Dla Ciebie:” przed zdaniem wyjaśnienia (sam dopisek, nie reguła).

## wyglad 0.31.0: zakreślacz w wyjaśnieniu; koniec przygaszania „starszych” odpowiedzi (2026-11-01)
- Stefan: „zajmij się tym wyjaśnieniem na początku, które jest kluczowe, ale nie jest wyróżnione” (decyzja 1B z tego dnia). Nowy moduł `hooks/zakreslacz.ts`: akapit prozy w wyjaśnieniu z pogrubieniem jest rysowany jako zdanie z zakreśloną frazą (Text w Text z tłem `mark`: ciemny motyw #4a4420, jasny #FFF0A6); akapity z linkiem lub kodem, listy, tabele i nagłówki zostają Markdown. Przycisk „Tylko wyróżnione” zostawia same zakreślone frazy (stan `onlyMarks` na odpowiedź), „Pokaż całość” przywraca. Reguła układu odpowiedzi: w każdym akapicie wyjaśnienia dokładnie jedno pogrubienie niosące sens akapitu.
- Stefan: „Ustawianie zadań jako nieaktualnych powinno odbywać się tylko wtedy, gdy otrzymałeś na nie odpowiedź, a nie wtedy, gdy pojawia się kolejne pytanie… To nie jest poprawne.” Usunięte przygaszanie i linia „Starsza odpowiedź…” z 0.27.0/0.28.2: zadania i pytania starszych odpowiedzi są pełne, z przyciskami. Przygaszone są tylko: zadania odhaczone (Stefan albo narzędzie `odhacz`), zadania unieważnione przez Claude jako zastąpione, pytania, na które Stefan odpowiedział. Testy dopasowane.

## wyglad 0.31.1: zakreślacz wszędzie, i po co jest wyjaśnienie (2026-11-01)
Stefan: „»zakreślać« jest świetne, ale powinno być używane wszędzie, nie tylko w sekcji wyjaśnienia” oraz „popracuj jeszcze lepiej nad tymi wyjaśnieniami i wyjaśnij, jaką pełnią funkcję, ponieważ stanowią główną treść”. Mod: pomocnik `marked()` rysuje pogrubienie jako zakreślenie także w wyjaśnieniu zadania, w „Dlaczego to ważne” pytania, w treści opcji i w szarym rozwinięciu punktu podsumowania (zakreślona fraza nie jest szara). `taskOf` zachowuje pogrubienia w wyjaśnieniu zadania (dotąd wycinał wszystkie). Reguła układu odpowiedzi: akapit „Po co jest wyjaśnienie” (główna treść, opowieść dla Stefana wracającego po tygodniu; ramki to tylko lista działań i wyników) i zasada jednego zakreślenia na akapit wszędzie.

