# PRZEKAZANIE — sesja „💻 🏡 ⚙️ Mody” (zapisane 2026-11-11, sesja zużyta: trzy streszczenia, zapis ponad 40 MB)

## Cel sesji
Mody Claude Code Stefana w repozytorium `C:\Projekty\claude-mody` (GitHub `stefanschwarz-commits/claude-mody`): wyglad, projekt,
dzwiek, komputer, straznik; skill `uklad-odpowiedzi` (część A = reguła `~/.claude/rules/wyglad-uklad-odpowiedzi.md`, część B = układ
bez nakładki) wgrywany na trzy konta claude.ai. Tok pracy: `CLAUDE.md` w repozytorium (pull → edycja → validate + test → wersja →
DECYZJE/STAN → commit/push → `claude plugin marketplace update claude-mody` → `claude plugin update <mod>@claude-mody` → zadanie
„zamknij i otwórz aplikację”).

## Stan (2026-11-11)
- wyglad 0.41.1 (ostatnie: pytanie wpisane w wyjaśnieniu bez nagłówka, z opcjami w jednej linii, dostaje ramkę i przyciski; wcześniej
  0.41.0 kafle stanu, schowane szczegóły punktów, ramka „Brak uprawnień”; 0.40.x nowy pasek, odnośniki ze ścieżką z nawiasem).
- projekt 0.2.0: pasek nad polem = „▣ konto · tytuł sesji · ostatnio: … · czeka/w toku: najpilniejsza sprawa z STAN.md”.
- straznik 0.1.0, dzwiek 0.1.0, komputer 0.2.0 bez zmian.
- Skill `uklad-odpowiedzi` w kontach: Personal v12, ELMI v5, ATERIMA v4 (treść z 0.41.0; wgrane 2026-11-09). Po każdej zmianie
  reguły: odśwież SKILL.md, commit, po „tak” Stefana wgraj przez Replace (przeglądarka wbudowana, base64 → DataTransfer; zapis
  w sessionStorage przetrwa przełączanie kont; menu konta „Stefan · …” w lewym dolnym rogu, pozycje `menuitemradio`).
  Identyfikatory skilla w pamięci sesji: `~/.claude/projects/C--Projekty-claude-mody/memory/skill-uklad-odpowiedzi-w-koncie-claude-ai.md`.
- Wszystko wypchnięte; `git status` czysty.

## Decyzje Stefana dosłownie (najnowsze)
- 2026-11-11 (zrzut, sesja ELMI): „pytania nie są odpowiednio, no nie są potraktowane zostały jako pytania. Natomiast materiały do
  pytań są de facto nad pytaniem osobno przed odpowiedzią, czego nie rozumiem.” → 0.41.1; karty plików nad odpowiedzią stawia
  aplikacja, mod ich nie przenosi.
- 2026-11-09: „zaktualizuj mod wyglad”, „tak” (wgranie skilla na trzy konta).
- 2026-11-08 (zrzut): link do pliku w folderze z „(ELMI)” rozpadał się → 0.40.1.
- 2026-11-07: pasek projektu: „Zależy mi, aby odliczał, ile dni minęło od ostatniej aktualizacji”; lista: konto, nazwa wątku, data
  ostatniej aktywności, najpilniejsza sprawa (czeka / w toku); „No, wygląda w porządku.”
- 2026-11-04: 2A/3A/4A/5A/1A, „To zakreślanie w ogóle nie działa, bo brzydko wygląda na czarnym tle.” → wyróżnienie: zdanie białe
  pogrubione, reszta szara; pełna szerokość; tabela przy ≥3 równoległych sprawach; bez mniejszej czcionki.
Pełna lista: `DECYZJE.md` (od końca).

## Otwarte sprawy
- Próbka większej czcionki (odpowiedź Stefana „1C” z początku listopada) — czeka na jego chwilę; mod umie `size` w Text.
- Zasada o wizualizacjach — po obejrzeniu przez Stefana schematu na telefonie.
- Pasek projektu: ewentualny człon „na Ciebie: N pytań, M zadań” (odrzucona linia „Potrzebuję od Ciebie” z moda wyglad); tylko na prośbę.
- Jeśli Stefan zgłosi, że obrazy do pytania mają być w ramce pytania: to karty plików aplikacji (SendUserFile), poza zasięgiem moda;
  jedyna droga w modzie to Image/Svg z `$.fs.read` pliku wskazanego w treści — do rozważenia jako nowa funkcja po jego decyzji.

## Ważne pliki
- `plugins/wyglad/hooks/register.tsx`, `split.ts` (sekcje, pytania, `INLINE_QUESTION`, `splitInlineOptions`), `zakreslacz.ts`
  (wyróżnienia, odnośniki `LINK`/`linkRe`, `hrefOf`), testy `*.test.ts` (75 pass).
- `plugins/projekt/hooks/register.tsx`, `parse.ts` (sekcje „Czeka”, „W toku / czeka”, `urgent`, `when`).
- `skills/uklad-odpowiedzi/SKILL.md`; wzorzec bez nakładki: OneDrive ELMI „Instrukcje Claude” → `do-instrukcji-ogolnych-uklad-odpowiedzi-bez-nakladki.md`.
- Pułapka: heredoc w Bash połyka `\n` i `\\` — skrypty Pythona do edycji pisz narzędziem Write i uruchamiaj z pliku.

## Czego nie robić
- Nie zmieniać ustaleń wyglądu z CLAUDE.md bez decyzji Stefana; nie wgrywać skilla do kont bez jego „tak”.
- Nie archiwizować tej sesji bez słowa „archiwizuj” od Stefana po starcie następczyni.
- Mody tylko w tym repozytorium; każda wersja z podbitym numerem (ten sam numer = instalator pomija).
