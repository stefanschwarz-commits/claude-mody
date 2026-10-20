# STAN – claude-mody

Aktualizacja: 2026-10-20 · Folder roboczy: C:\Projekty\claude-mody (kopia repozytorium; mody instaluje się z GitHuba poleceniem `claude plugin update <mod>@claude-mody`)


| Sprawa | Status | Następny krok | Kto |
|---|---|---|---|
| Mod `dzwiek` 0.1.0 (dźwięk na koniec pracy i przy pytaniu) | Działa | — | — |
| Mod `projekt` 0.1.2 (pasek projektu nad polem, /stan) | Działa, dzieli pasek z innymi modami | — | — |
| Mod `komputer` 0.1.0 (znaczek 💻 w tytule sesji lokalnej) | Zainstalowany; do sprawdzenia w nowej sesji i w sesji z zadania zaplanowanego | Stefan otwiera nową sesję, pisze dwie wiadomości i patrzy na tytuł | Stefan |
| Mod `wyglad` 0.23.2 | Zainstalowany: ramki sekcji w kolorach, zadania numerowane (niebieskie), karty pytań 1A/1B ★, skrót „1 zrobiłem” + narzędzie `odhacz`, linia stanu, panel „Moje sprawy”, podpowiedź dla Claude o układzie odpowiedzi; krótka odpowiedź końcowa bez ▶ nie jest już szarym dopiskiem | Stefan restartuje aplikację | Stefan |
| Podpowiedź moda o układzie odpowiedzi i znaczek 💻 nie docierają na koncie ELMI | Przyczyna: wbudowana wtyczka bezpieczeństwa Claude 2.1.304 na planie Team pomija hooki modów (prompt.compose, SessionStart, UserPromptSubmit). Obejścia 2026-10-20 (1A, 2A): reguła `~/.claude/rules/wyglad-uklad-odpowiedzi.md` i hook `~/.claude/hooks/znaczek-komputer.js` w ustawieniach | Sprawdzić w nowej sesji na ELMI; zdjąć obejścia, gdy Anthropic poprawi | Stefan |
| Kolor ramki zadań | Niebieski, potwierdzony przez Stefana (1A) | — | — |
| Ikony i kropki jako grafika SVG (Tabler, MIT) | Wdrożone w 0.22.0 (styl 1B, wszystkie znaczki 2A); przyciski zostają tekstowe | Stefan ogląda po restarcie | Stefan |
| Karty opcji obok siebie (własny obszar HTML, tylko komputer) | Następne w kolejce | — | Claude |
| Zegar (przypomnienia o czekających zadaniach) | Pomysł, Stefan chce wyjaśnień | Wrócić po ikonach i kartach | Claude |
| Blokada groźnych poleceń, lista wyboru w kartach | Odłożone decyzją Stefana | — | — |
| Instrukcja współpracy | Wersja 9 (obowiązuje od 2026-10-19): zadania bez „Zadanie N:”, kropka 🔵 przy zadaniach jak przy pytaniach; pole instrukcji wspólne dla Personal, ELMI i ATERIMA SERVICES | — | Instrukcje dla Claude |
| Pusty folder OneDrive „Mody Claude Code” | Usunięty | — | — |

Ustalenia wyglądu (stałe): kolorowe kropki ● zamiast kolorowego tekstu; tytuł ramki w środku ramki; opcje nazywane jak przyciski (1A, 1B), polecana z ★; bez tabel w pytaniach; w tabelach ✓ ✗ ~ ?; zadania numerowane, bez kratek w odpowiedzi (kratki tylko w panelu); pogrubiony początek punktu to wynik, szare rozwinięcie; blok do wklejenia zawsze w całości pod ramką.
