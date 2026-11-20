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
   Potem to samo w folderze domowym z `--scope project` (`cd ~ && claude plugin update <mod>@claude-mody --scope project`): jest tam
   druga instalacja modów i bez tego sesje z folderu domowego rysują starą wersją. Na koniec sprawdź w
   `~/.claude/plugins/installed_plugins.json`, że oba wpisy mają nowy numer.
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

## Skill osobisty „ładnie-stefan” (dla zespołu: „ładnie” z folderu skills/uklad-odpowiedzi-zespol; opis „Ładny Wygląd”; jedno źródło układu odpowiedzi, od 2026-11-01; dawniej „uklad-odpowiedzi”, potem „ladny”)
**Źródłem jest `skills/uklad-odpowiedzi/SKILL.md`, reguła `~/.claude/rules/wyglad-uklad-odpowiedzi.md` jest jego kopią**
(decyzja Stefana 1B, 2026-11-20; do tej pory było odwrotnie i zmiany zrobione tylko w skillu groziły cofnięciem). SKILL.md = część A
(układ z nakładką, Claude Code) + część B (układ bez nakładki dla Cowork i czatu).
Każda zmiana układu odpowiedzi, w tej kolejności: edycja SKILL.md → `python -X utf8 skills/uklad-odpowiedzi/do-reguly.py` (przepisuje
treść do reguły, nagłówek YAML reguły zostaje, kopia starej w `~/.claude/kopie-regul/`) → commit i push → po „tak” Stefana wgraj
nową wersję w claude.ai (Customize → Skills → ładnie-stefan) na ELMI i ATERIMA przez Replace (Personal dostaje kartą).
Reguły nie edytuj bezpośrednio: zmiana wpisana tylko w regule zniknie przy następnym przepisaniu. Przed edycją SKILL.md uruchom
skrypt z `--sprawdz` – „Reguła już zgodna ze skillem” znaczy, że nikt nie zmienił reguły ręcznie; inaczej najpierw przenieś tę zmianę do SKILL.md.
Folder w repo zostaje `skills/uklad-odpowiedzi/` (cytują go reguła i część A); nazwę daje tylko linia `name:`, która
musi zostać `name: ładnie-stefan` (polska litera przechodzi); nagłówka YAML przy edycji nie zmieniaj.
Replace w claude.ai odrzuca zmianę nazwy („Skill name mismatch”), więc przy kolejnej zmianie nazwy: nowy skill przez Upload,
stary tylko wyłączony; usunięcie starego wyłącznie po zgodzie Stefana.

