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
