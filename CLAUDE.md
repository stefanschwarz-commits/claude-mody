# claude-mody – zasady dla każdej sesji „Mody” (konto Personal i konto ELMI)

Mody są instalowane raz dla całego komputera (`~/.claude/plugins`, zakres `user`), więc oba konta Claude
widzą ten sam wygląd od razu po instalacji. Jedynym źródłem prawdy jest to repozytorium; sesje na dwóch
kontach nie muszą sobie nic przesyłać, wystarczy że obie pracują tutaj według tych samych kroków.

## Zanim coś zmienisz
1. `git pull` – druga sesja (na drugim koncie) mogła już coś wydać.
2. Przeczytaj `STAN.md` (co jest w toku) i ostatnie wpisy `DECYZJE.md` (co Stefan już postanowił; nie cofaj tego).

## Każda zmiana w modzie, w tej kolejności
1. Edycja w `plugins/<mod>/` (narzędziem Edit, nie skryptami z `\n` w heredocu – psują się escape'y).
2. `claude plugin validate .` oraz `claude plugin test plugins/<mod>` (wszystkie testy muszą przejść; nowy przypadek = nowy test).
3. Podbij `version` w `plugins/<mod>/.claude-plugin/plugin.json`.
4. Dopisz wpis do `DECYZJE.md` (co i dlaczego, z datą) i zaktualizuj wiersz w `STAN.md`.
5. `git commit` + `git push`.
6. `claude plugin marketplace update claude-mody` i `claude plugin update <mod>@claude-mody`.
7. Stefanowi: jedno zadanie „zamknij i otwórz aplikację Claude”, bo mod ładuje się przy starcie.

## Ustalenia wyglądu (nie zmieniać bez decyzji Stefana)
Kolorowe kropki zamiast kolorowego tekstu; tytuł ramki wewnątrz ramki z ikoną Tabler; opcje nazywane jak
przyciski (1A, 1B), polecana z białą ★ z czcionki; zadania numerowane, bez kratek w odpowiedzi; niebieska
ramka zadań i pytań, pomarańczowe „Niewyjaśnione”; pogrubiony początek punktu to wynik, szare rozwinięcie;
blok do wklejenia i linki do plików na komputerze pod ramką, nie w niej.

## Instrukcje globalne: jedne dla wszystkich kont
Pole instrukcji w Ustawieniach claude.ai (plik `instrukcje-globalne-vN.md` w OneDrive „Instrukcje Claude”) jest
jedno dla profilu Stefana: Personal, ELMI i ATERIMA SERVICES mają tę samą treść (sprawdzone 2026-10-19), więc
wkleja się je raz. Bez nich Claude pisze w innym układzie i mod rysuje tylko część ramek; jeśli ramki rozjeżdżają
się tylko na jednym koncie, najpierw sprawdź, czy sesja ma instrukcje w kontekście. Zmiany w instrukcjach idą
przez sesję „Instrukcje dla Claude”. Pamięć sesji i reguły w `~/.claude/rules` są wspólne dla komputera.
