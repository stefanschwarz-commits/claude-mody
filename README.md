# Claude mody

Własne mody (wtyczki) do Claude Code Stefana.

**Jedyne źródło modów:** https://github.com/stefanschwarz-commits/claude-mody (gałąź `main`). Każda sesja Claude, na każdym koncie i komputerze, instaluje i aktualizuje mody wyłącznie stąd, żeby wszędzie były identyczne. Repozytorium jest publiczne (decyzja Stefana z 2026-10-22), więc instalacja nie wymaga logowania do GitHuba.

## Dla innych sesji i kont: gdzie są mody i jak je zainstalować

Mody działają w programie Claude Code na komputerze, nie na koncie claude.ai. Na jednym komputerze są wspólne dla wszystkich kont, na które Stefan się loguje (Personal, ELMI, ATERIMA SERVICES). Na nowym komputerze trzeba je zainstalować raz, w terminalu (PowerShell na Windows, Terminal na Macu):

```
claude plugin marketplace add stefanschwarz-commits/claude-mody
claude plugin install dzwiek@claude-mody
claude plugin install projekt@claude-mody
claude plugin install wyglad@claude-mody
claude plugin install komputer@claude-mody
```

Aktualizacja do najnowszej wersji (po każdej zmianie w repozytorium):

```
claude plugin marketplace update claude-mody
claude plugin update dzwiek@claude-mody
claude plugin update projekt@claude-mody
claude plugin update wyglad@claude-mody
claude plugin update komputer@claude-mody
```

Sprawdzenie, co jest zainstalowane i w jakiej wersji: `claude plugin list`.

Zasady dla sesji Claude:
- Zmiany w modach robi się tylko w tym repozytorium (folder roboczy na komputerze Stefana: `C:\Projekty\claude-mody`), nigdy w ukrytej kopii, którą Claude Code trzyma u siebie, ani w kopii na OneDrive. Pełny tok pracy jest w `CLAUDE.md`.
- Po zmianie: podbić wersję w `plugin.json` danego moda, dopisać decyzję do `DECYZJE.md`, wypchnąć na `main`, a potem na komputerze uruchomić polecenia aktualizacji powyżej.
- Sesja w chmurze (claude.ai/code) może zmieniać kod i wypychać go, ale nie zainstaluje moda na komputerze Stefana; instalację robi sesja lokalna albo Stefan.

Gotowy akapit do instrukcji współpracy (pole instrukcji w ustawieniach claude.ai jest jedno dla wszystkich kont Stefana, więc wkleja się je raz; zmiany instrukcji idą przez sesję „Instrukcje dla Claude”):

> MODY CLAUDE CODE. Moje mody (dźwięk, projekt, wygląd, komputer) są wyłącznie w https://github.com/stefanschwarz-commits/claude-mody; plik README mówi, jak je zainstalować i zaktualizować. Nie twórz kopii modów w innym miejscu. Zmiany modów zgłaszaj albo rób tylko w tym repozytorium.

## dzwiek

Krótki, miękki dźwięk, gdy Claude skończy pracę i czeka na Ciebie, oraz inny (dwa krótkie „pingi”), gdy prosi o zgodę, zadaje pytanie albo chce zatwierdzenia planu. Działa na Windows (PowerShell), macOS (afplay) i Linuksie.

### Instalacja (raz, w terminalu: PowerShell albo Terminal na Macu)

```
claude plugin marketplace add stefanschwarz-commits/claude-mody
claude plugin install dzwiek@claude-mody
```

Albo w sesji `claude` w terminalu:

```
/plugin install dzwiek --marketplace stefanschwarz-commits/claude-mody
```

### Obsługa

- `/dzwiek test` – zagraj oba dźwięki
- `/dzwiek off` – wycisz, `/dzwiek on` – włącz
- całkowite wyłączenie: `claude plugin disable dzwiek@claude-mody`

## projekt

Pasek nad polem wpisywania: nazwa folderu projektu, ile spraw jest „w toku” (z pierwszą z nich), ile „dalej” i z kiedy jest plik STAN.md. Odświeża się po każdej odpowiedzi Claude'a. Rozumie STAN.md z nagłówkami, pogrubionymi etykietami („**W toku:** …”) albo tabelą z kolumną Status.

```
claude plugin install projekt@claude-mody
```

- `/stan` – stan projektu w tabeli
- `/stan nowy` – zakłada pusty STAN.md w bieżącym folderze
- pasek zwijasz znakiem `[-]` po jego prawej stronie

## wyglad

Odpowiedzi Claude'a w Claude Code, rysowane według sekcji odpowiedzi (linia ▶, potem Zrobione, Nie udało się, Niewyjaśnione, Do zrobienia przez Ciebie, Pytania do Ciebie, Dla informacji; kreski `---` między sekcjami nie są konieczne):
- jasny pasek „▶ Nowa odpowiedź” zaznacza początek ostatniej odpowiedzi (starsze mają szary „▶ Odpowiedź”), pod nim wniosek;
- „Do zrobienia przez Ciebie” w niebieskiej ramce: zadania z numerami, pogrubione „co zrobić”, szare „po co”; przedrostek „Zadanie N:” z instrukcji jest zdejmowany;
- każde pytanie w niebieskiej karcie: opcje jako `1A`, `1B ★` (polecana z gwiazdką), przyciski `Wybierz 1A` wpisują odpowiedź w pole;
- podsumowanie w osobnych ramkach z tytułem w środku: Zrobione (zielona), Nie udało się (czerwona), Niewyjaśnione (pomarańczowa), Dla informacji (szara); punkt ma pogrubiony wynik i szare rozwinięcie, linki są klikalne; blok do wklejenia stoi pod ramką w całości;
- pasek nad polem wpisywania: ile zadań i pytań czeka, przyciski „↑ Początek odpowiedzi” i „Moje sprawy”;
- linia stanu na dole: „czeka: 2 zadania, 1 pytanie”;
- skrót „1 i 3 zrobiłem, 2 odpada”: mod dopisuje Claude'owi treść zadań o tych numerach, a Claude odhacza je narzędziem `odhacz` w panelu „Moje sprawy”;
- krótkie komunikaty w trakcie pracy i kroki pracy zwinięte do jednej szarej linii; błędy zostają widoczne;
- powiadomienie w rogu na koniec pracy, gdy coś na Ciebie czeka;
- panel boczny „Moje sprawy” (`/sprawy` albo przycisk w pasku): zadania do odhaczenia i pytania, z odnośnikami ↗ do miejsca w odpowiedzi.

```
claude plugin install wyglad@claude-mody
```

- `/wyglad off` – zwykły wygląd, `/wyglad on` – kolorowy
- `/sprawy` – panel „Moje sprawy”

## komputer

Tytuł każdej sesji na komputerze zaczyna się od „💻 ” (sesje w chmurze zostają bez znaczka). Mod dopisuje znaczek tylko wtedy, gdy go brakuje, i nie zmienia reszty tytułu, więc dyspozytor poczty nadal znajduje sesje po dokładnym tytule. Nowa sesja dostaje tytuł od aplikacji po pierwszej wiadomości, więc znaczek pojawia się przy drugiej.

```
claude plugin install komputer@claude-mody
```
