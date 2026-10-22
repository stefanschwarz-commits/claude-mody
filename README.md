# Claude mody

Własne mody (wtyczki) do Claude Code Stefana.

**Jedyne źródło modów:** https://github.com/stefanschwarz-commits/claude-mody (gałąź `main`). Każda sesja Claude, na każdym koncie i komputerze, instaluje i aktualizuje mody wyłącznie stąd, żeby wszędzie były identyczne. Repozytorium jest prywatne: potrzebny jest dostęp z konta GitHub `stefanschwarz-commits` (na komputerze Stefana jest już zalogowany).

## Dla innych sesji i kont: gdzie są mody i jak je zainstalować

Mody działają w programie Claude Code na komputerze, nie na koncie claude.ai. Na jednym komputerze są wspólne dla wszystkich kont, na które Stefan się loguje. Na nowym komputerze trzeba je zainstalować raz, w terminalu (PowerShell na Windows, Terminal na Macu):

```
claude plugin marketplace add stefanschwarz-commits/claude-mody
claude plugin install dzwiek@claude-mody
claude plugin install projekt@claude-mody
claude plugin install wyglad@claude-mody
```

Aktualizacja do najnowszej wersji (po każdej zmianie w repozytorium):

```
claude plugin marketplace update claude-mody
claude plugin update dzwiek@claude-mody
claude plugin update projekt@claude-mody
claude plugin update wyglad@claude-mody
```

Sprawdzenie, co jest zainstalowane i w jakiej wersji: `claude plugin list`.

Zasady dla sesji Claude:
- Zmiany w modach robi się tylko w tym repozytorium (folder roboczy na komputerze Stefana: `C:\Projekty\claude-mody`), nigdy w ukrytej kopii, którą Claude Code trzyma u siebie, ani w kopii na OneDrive.
- Po zmianie: podbić wersję w `plugin.json` danego moda, dopisać decyzję do `DECYZJE.md`, wypchnąć na `main`, a potem na komputerze uruchomić polecenia aktualizacji powyżej.
- Sesja w chmurze (claude.ai/code) może zmieniać kod i wypychać go, ale nie zainstaluje moda na komputerze Stefana; instalację robi sesja lokalna albo Stefan.

Gotowy akapit do instrukcji współpracy (wklejany do ustawień każdego konta claude.ai):

> MODY CLAUDE CODE. Moje mody (dźwięk, projekt, wygląd) są wyłącznie w https://github.com/stefanschwarz-commits/claude-mody; plik README mówi, jak je zainstalować i zaktualizować. Nie twórz kopii modów w innym miejscu. Zmiany modów zgłaszaj albo rób tylko w tym repozytorium.

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

## wyglad (wersja testowa)

Odpowiedzi Claude'a w Claude Code:
- kolorowy pasek „▶ Nowa odpowiedź” zaznacza początek ostatniej odpowiedzi (starsze mają szary), pod nim wniosek;
- „Potrzebuję od Ciebie”: zadania i pytania razem, pytania z tabelą opcji i przyciskami (np. `1A`, `1B` – wpisują odpowiedź w pole);
- Zrobione i Problem zwinięte do jednej linii (zielona / czerwona), przycisk „Pokaż szczegóły” rozwija;
- pasek nad polem wpisywania: ile zadań i pytań czeka na Ciebie oraz przycisk „↑ Początek odpowiedzi”;
- krótkie komunikaty z trakcie pracy i kroki pracy (czytanie plików, polecenia) zwinięte do jednej szarej linii; błędy zostają widoczne;
- zadania z kratką ☐ do odhaczenia; pasek liczy tylko te, które zostały;
- długie wyjaśnienia: pierwsze 8 linii i przycisk „Pokaż więcej”;
- powiadomienie w rogu na koniec pracy, gdy coś na Ciebie czeka;
- panel boczny „Moje sprawy” (`/sprawy` albo przycisk w pasku): wszystkie zadania z rozmowy do odhaczenia i pytania z przyciskami odpowiedzi.

```
claude plugin install wyglad@claude-mody
```

- `/wyglad off` – zwykły wygląd, `/wyglad on` – kolorowy
- `/sprawy` – panel „Moje sprawy”
