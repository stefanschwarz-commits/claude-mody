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
