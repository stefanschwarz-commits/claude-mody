# Mody dla zespołu (ELMI i ATERIMA): instalacja u pracownika

Mody działają tylko w aplikacji Claude na komputerze, w części do pracy z kodem (Claude Code). Nie działają w zwykłym czacie claude.ai ani w telefonie.

## Które mody dla pracowników
- **wyglad** – ramki z zadaniami i pytaniami, przyciski odpowiedzi. Rysuje je tylko wtedy, gdy Claude pisze w układzie odpowiedzi z instrukcji organizacji (patrz niżej).
- **projekt** – pasek nad polem wpisywania: kolorowa nazwa organizacji, tytuł sesji, ostatnia aktywność, najpilniejsza sprawa z pliku STAN.md.
- **dzwiek** – dźwięk, gdy Claude skończy albo o coś pyta (opcjonalnie).
- Nie dla pracowników: **komputer** i **straznik** (blokady i narzędzia ustawione pod Stefana).

## Instalacja (raz, w terminalu: PowerShell na Windows)

```
claude plugin marketplace add stefanschwarz-commits/claude-mody
claude plugin install wyglad@claude-mody
claude plugin install projekt@claude-mody
claude plugin install dzwiek@claude-mody
```

Potem zamknij i otwórz aplikację Claude. Aktualizacja: `claude plugin marketplace update claude-mody`, potem `claude plugin update <nazwa>@claude-mody`.

## Układ odpowiedzi
Ramki rysują się tylko wtedy, gdy Claude zna układ odpowiedzi (linia ▶, sekcje „Zrobione”, „Zadania dla Ciebie”, „Pytania do Ciebie”). Dla pracowników układ ma trafić do instrukcji organizacji ELMI i ATERIMA w wersji bez spraw osobistych Stefana. Zmiana instrukcji organizacji tylko po jego „tak” do konkretnego tekstu (reguła „dobre praktyki do instrukcji firmowych”).

## Organizacje na pasku
Pasek rozpoznaje organizację po jej numerze: ELMI niebieski, ATERIMA czerwony, konto prywatne zielone.
