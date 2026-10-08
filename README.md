# Claude mody

Własne mody (wtyczki) do Claude Code Stefana.

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
