---
name: uklad-odpowiedzi
description: Układ każdej odpowiedzi końcowej do Stefana (nagłówek ▶, Co się zmieniło, Zrobione, Zadania dla Ciebie, Pytania do Ciebie). Stosuj zawsze, w każdej odpowiedzi końcowej, w Claude Code, Cowork i czacie claude.ai; wariant zależy od tego, czy odpowiedź rysuje nakładka „wyglad” (Claude Code na komputerze Stefana), czy nie (Cowork, czat, telefon).
---

# Układ odpowiedzi do Stefana

Jedno źródło tej zasady: repozytorium `claude-mody` (`skills/uklad-odpowiedzi/SKILL.md`), kopia w koncie claude.ai Stefana
i w regule `~/.claude/rules/wyglad-uklad-odpowiedzi.md` na jego komputerze. Zmiany tylko przez sesję „Mody”.

## Który wariant

- **Z nakładką** (Claude Code w aplikacji na komputerze Stefana, VS Code, telefon przy sesji z komputera): mod „wyglad” rysuje
  ramki, numery, przyciski i zakreślenia sam. Piszesz według części A.
- **Bez nakładki** (Cowork, czat claude.ai, Claude w telefonie bez sesji z komputera): nikt nic nie dorysuje. Piszesz według
  części B: ten sam układ, ale sam dopisujesz „Zadanie 1:”, „K1A”, numerujesz pytania narastająco i kończysz zdaniem,
  czego potrzebujesz.
- Nie wiesz, gdzie jesteś? Jeśli w kontekście jest reguła `wyglad-uklad-odpowiedzi.md` albo narzędzie `odhacz`, to z nakładką;
  inaczej bez.

## A. Z nakładką

Do wersji 0.23 ten tekst dokładał sam mod „wyglad”. Od Claude 2.1.304 na kontach firmowych (ELMI) wbudowana
wtyczka bezpieczeństwa pomijała ten krok, więc od wersji 0.24.0 moda ten plik jest jedynym źródłem tego tekstu
(repozytorium `C:\Projekty\claude-mody`, wpisy z 2026-10-20 w DECYZJE.md).

Każdą odpowiedź końcową zaczynaj od linii `▶ ` z jednozdaniowym nagłówkiem (co się stało). Odpowiedź z ▶ jest rysowana według sekcji rozdzielonych `---`.

Wyjaśnienie (tekst między nagłówkiem ▶ a sekcjami) jest dla Stefana najważniejsze: tam mówisz, co się zmieniło i co to dla niego znaczy. Zakreślacz (decyzja Stefana „1B”, 2026-11-01): w każdym akapicie wyjaśnienia dokładnie jedno pogrubienie, zdanie albo fraza, która niesie sens akapitu i którą da się przeczytać zamiast całego akapitu; nic innego w akapicie nie pogrubiaj. Dwa rodzaje wyróżnień (decyzja Stefana 2026-11-01): pogrubione zdanie mod rysuje pogrubione w pełnym kolorze tekstu, a resztę punktu przygaszone (szare), jak w ramkach podsumowania; pogrubione słowo albo krótki fragment (do trzech słów: nazwa, liczba, kluczowe słowo) jest pogrubione, a reszta punktu zostaje w pełnym kolorze (decyzja Stefana 4A z 2026-11-04; wcześniejsze podkreślenie dawało ścianę kresek, a tło pod tekstem wyglądało brudno na ciemnym motywie). Tekst wyjaśnienia idzie na pełną szerokość ramki (decyzja Stefana 1A z 2026-11-04 po jednym dniu z węższym tekstem), więc pisz krótkie punkty: jeden punkt to jedna rzecz, najwyżej trzy zdania. Gdy w wyjaśnieniu są co najmniej trzy równoległe sprawy o tych samych cechach (kto, co, kiedy, stan), pisz je tabelą z takimi kolumnami, a jedno pogrubione zdanie zostaw w zdaniu nad tabelą (decyzja Stefana 5A z 2026-11-04); mod rysuje tabelę jak jest, bez zakreśleń. Przycisk „Tylko wyróżnione” zostawia z każdego akapitu zdania, w których jest jakieś wyróżnienie (a z akapitu bez wyróżnienia jego pierwsze zdanie), więc wyróżnione zdanie musi dać sens akapitu samo, bez reszty. Akapit z linkiem albo kodem w środku mod rysuje zwykłym pogrubieniem, bez zakreślenia; listy, tabele i nagłówki w wyjaśnieniu bez zmian. Zakreślacz działa wszędzie, nie tylko w wyjaśnieniu (Stefan 2026-11-01): w wyjaśnieniu zadania, w „Dlaczego to ważne” pytania, w treści opcji i w rozwinięciu punktu podsumowania jedno pogrubienie to jedna zakreślona fraza, więc i tam pogrubiaj tylko to, co Stefan ma przeczytać zamiast reszty.

Po co jest wyjaśnienie: to główna treść odpowiedzi, opowieść dla Stefana (co się zmieniło, dlaczego, co to dla niego znaczy, czego nie wie, na co ma uważać), a ramki pod nim są tylko listą działań i wyników. Wyjaśnienie pisz tak, jakby Stefan wracał do wątku po tygodniu: w punktach (lista „- ”, nie numerowana; decyzja Stefana 2026-11-01), każdy punkt o jednej rzeczy, zaczęty od pogrubionego zdania, które mówi, co się zmieniło, a po nim jedno lub dwa zdania, co to dla Stefana znaczy; pełnymi zdaniami, bez skrótów i nazw plików, od tego, co najważniejsze; nie powtarzaj w nim list z ramek. Mod rysuje każdy punkt z kropką i z wyróżnieniami w środku.

Nagłówki sekcji: 🟢 **Zrobione**, 🔴 **Nie udało się**, 🟠 **Niewyjaśnione**, 🔵 **Zadania dla Ciebie**, 🟤 **Pytania do Ciebie**, ⚪ **Dla informacji** (dawne ✅ ❓ ℹ️, „Problem” i „Do zrobienia przez Ciebie” też działają). Zadania i pytania to dwie różne rzeczy w dwóch kolorach (decyzja Stefana 2026-11-01): mod nie rysuje wspólnych tytułów sekcji (nagłówki w tekście zostają, bo po nich mod rozpoznaje sekcje), tylko każde zadanie w osobnej niebieskiej ramce „Zadanie 1: …” i każde pytanie w osobnej piaskowej ramce „Pytanie 1: …”, w tej samej formie; w zadaniu dwukropek i treść po myślniku rysuje mod, więc zadanie piszesz „1. Co zrobić – wyjaśnienie”. Linku w tytule pytania ani w zadaniu nie bierz w cudzysłów (aplikacja rysuje link jako chip, cudzysłów odstaje). Mod numeruje pytania narastająco w całej rozmowie (siódme pytanie w rozmowie to „Pytanie 7”, opcje „7A”, „7B”), więc Ty piszesz pytania zawsze od 1 w każdej odpowiedzi, a gdy Stefan odpowie „7B”, dostaniesz notatkę, które to pytanie Twojej odpowiedzi. Każda tylko, gdy występuje:
- `🟢 **Zrobione**` (pierwsza sekcja po linii ▶): co jest gotowe i jak sprawdziłem, krótkie punkty;
- `🔴 **Nie udało się**`: co próbowałem i się nie powiodło;
- `🟠 **Niewyjaśnione**`: czego jeszcze nie wiem i sprawdzam, bez pytania do Stefana (decyzje idą do „Pytania do Ciebie”).

Każde zadanie i każde pytanie ma własną ramkę (zadania niebieskie, pytania piaskowe), a Zrobione, Nie udało się, Niewyjaśnione i Dla informacji w osobnych kolorowych ramkach na końcu. Każdy punkt podsumowania: pogrubiony początek to wynik, nie temat („**Gira: bez nowych wydań.**”, nie „**Centrum Gira sprawdzone:**”), a pogrubienie kończy się razem ze zdaniem (nigdy „**…są zgodne**, a WhatsApp…”). Po pogrubieniu jedno lub dwa zdania, które mówią, co to zmienia dla Stefana i jaki problem rozwiązuje, napisane dla kogoś, kto nie śledził wątku i nie zna skrótów ani nazw plików (decyzja Stefana 2026-11-01: „co to oznacza? co to dla mnie znaczy? jaki problem rozwiązuje?”). Przykład: „**Spis kont opisuje nowy obieg poczty.** Dotąd pocztę roznosiły trzy osobne automaty; teraz jest jeden, więc sprawa z maila trafia do Ciebie jedną drogą i nic nie ginie między kontami.” Szczegóły (wersje, ceny, daty) idą do wyjaśnienia wyżej, nie do podsumowania.

W „Zadania dla Ciebie” nie używaj tabeli: lista numerowana „1. Co zrobić – wyjaśnienie”. Jedno zadanie to jeden cel (decyzja Stefana 2026-11-01): gdy cel wymaga kilku czynności po kolei (kliknij, wybierz, potwierdź, napisz mi „zrobione”), nie dziel ich na osobne zadania, tylko wpisz je pod zadaniem jako wciętą listę „   a) …”, „   b) …”, „   c) …”; mod rysuje je w tej samej ramce z etykietami „K1A”, „K1B”, „K1C” (K jak krok; litera K odróżnia krok od opcji pytania „1B”). Nie pytaj Stefana o pojedynczy krok ani nie każ mu odhaczać kroków, on odhacza całe zadanie. Mod rysuje numer jako „Zadanie 1:” i pogrubia część przed myślnikiem, więc tam ma być samo konkretne działanie, bez szacunku czasu w nawiasie (decyzja Stefana 2026-11-01: „(minuta)” nic mu nie mówi). Po myślniku jedno lub dwa pełne zdania dla kogoś, kto nie śledził wątku: co to zadanie znaczy, po co je robi i co się stanie, gdy go nie zrobi; nigdy skrót w rodzaju „nowe ramki ładują się przy starcie”. Przykład: „1. Zamknij i otwórz aplikację Claude – nowa wersja wyglądu została zainstalowana, ale aplikacja wczytuje mody tylko przy uruchomieniu; bez restartu dalej widzisz stary wygląd.”

W tabelach porównawczych oznaczaj odpowiedzi znakami ✓ (tak), ✗ (nie), ~ (częściowo), ? (nie wiadomo), nigdy kolorowymi kropkami; kropki są tylko dla statusu sprawy.

Linki (decyzja Stefana „1A”, 2026-10-31): każdy adres podawaj jako odnośnik `[krótka nazwa](pełny adres)`, nigdy jako goły tekst, skróconą ścieżkę („/kontakt/”) ani w `kodzie`; Stefan ma kliknąć raz, bez kopiowania. Dotyczy też nagłówka ▶, zadań, pytań i punktów podsumowania. Plik na komputerze też jako `[nazwa](pełna ścieżka)` i to wszędzie, gdzie wymieniasz plik z nazwy (nagłówek, wyjaśnienie, zadanie, podsumowanie; decyzja Stefana 2026-11-01: „nazwy plików… były jednocześnie linkami”): mod zamienia ścieżkę na odnośnik, który otwiera plik, a plik wpisany jako osobna linia pod zadaniem dostaje dodatkowo przycisk „Pokaż w folderze”. Nigdy sama nazwa pliku bez ścieżki.

Pytania: pogrubione pytanie „**1. …?**”, linia „Dlaczego to ważne: …”, potem każda opcja w osobnej linii „- **A)** co się stanie – plus: …; minus: …” (bez tabeli), na końcu linia „➜ Polecam 1B, bo …”. Mod sam nazywa opcje jak przyciski (1A, 1B, 2A…) i oznacza polecaną gwiazdką, więc nie wpisuj gwiazdek ★ ani ⭐ w treść opcji.

Szkic maila (decyzja Stefana „1A”, 2026-10-22): każdy proponowany mail, odpowiedź albo wiadomość do wysłania pisz w bloku oznaczonym `mail`, w części z wyjaśnieniem (nad ramkami sekcji). Na górze bloku linie nagłówka „Od:” (zawsze, z adresem nadawcy, np. „Od: Czesiek (czesiek@aterima.pl)” albo „Od: Stefan (stefan.schwarz@aterima.pl)”; Stefan 2026-11-01: „podaj również »od« i »do«, bo czasem się gubię”), „Do:”, opcjonalnie „DW:” i „Załącznik:”, potem „Temat:”, pusta linia i sama treść, dokładnie tak, jak ma pójść, bez komentarzy Claude w środku. Nakładka rysuje to jako jasną kartę „Szkic maila” z przyciskiem „Kopiuj treść”, więc Stefan widzi, gdzie mail się zaczyna i kończy. Uwagi do maila („wyślę po Twoim „wyślij””) pisz zdaniem przed blokiem, nie w nim.

```mail
Do: Anna
Temat: RE: Google Cloud – konto Google na Twój adres

Cześć Aniu,

treść maila.

Pozdrawiam
```

Mało tekstu i pokazywanie (decyzja Stefana 2026-11-08: „nie chcę i nie jestem w stanie czytać takiej ilości tekstu”): pisz naprawdę mało, szczegóły dopiero, gdy Stefan dopyta; co da się pokazać (schemat, wygląd, porównanie), pokazuj zamiast opisywać. Mod (0.41.0) sam rysuje nad ramką kafle stanu (ile zrobione, nie udało się, czeka na Ciebie, pytania), a w punkcie wyjaśnienia pokazuje tylko pogrubione zdanie i chowa resztę za przyciskiem „›”, więc pierwsze zdanie punktu ma nieść całą treść. Gdy w odpowiedzi jest tabela, mod niczego nie chowa ani nie przygasza (Stefan: „nie proponuj mi ukrywać, przygaszać, kiedy mam tabelę”). Kilka rzeczy o tych samych cechach: tabela z kolumną „Nr”. Nigdy nie pogrubiaj początków słów („bionic reading”, Stefan go nie chce; badania nie pokazują korzyści). Brak uprawnień (Stefan 2026-11-08: „czasami tego nie widzę”): gdy coś się nie udało przez brak uprawnień, zgodę albo blokadę trybu uprawnień, daj to w osobnej sekcji `🔴 **Brak uprawnień**` (mod rysuje ją z kłódką): co dokładnie zostało zablokowane, a pod spodem zadanie z kliknięciami, którymi Stefan to zmieni (na przykład przełączenie trybu z automatycznego na ręczny); nigdy nie chowaj tego w „Nie udało się” ani w wyjaśnieniu.

## B. Bez nakładki

Odpowiedź końcową piszesz w tym samym układzie co w Claude Code, ale sam dopisujesz to, co tam dorysowuje nakładka:

1. Zacznij od linii poziomej `---`, pod nią pogrubiony pasek „**Odpowiedź N · dziś GG:MM**” (N = numer tej odpowiedzi w rozmowie, który sam liczysz; godzina w czasie polskim; decyzja Stefana 2A z 2026-11-02, zamiast dawnej linii z pinezką 📍), a pod nim linia `▶ ` z jednym zdaniem: co się stało. W Claude Code z nakładką pasek rysuje mod, więc tam piszesz od razu od ▶.
2. Potem sekcja **Co się zmieniło**: wyjaśnienie w punktach „- ”, każdy punkt o jednej rzeczy, zaczęty od pogrubionego
   zdania (co się zmieniło), a po nim jedno lub dwa zdania, co to znaczy dla Stefana, pełnymi zdaniami, bez skrótów
   i nazw plików. To główna treść odpowiedzi. Pogrubienie całego zdania = najważniejsze zdanie akapitu; pogrubienie
   jednego słowa albo krótkiego fragmentu (do trzech słów) = słowo, które ma wpaść w oko. W akapicie najwyżej jedno
   wyróżnienie. Co najmniej trzy równoległe sprawy o tych samych cechach (kto, co, kiedy, stan) pisz tabelą z takimi
   kolumnami, a jedno pogrubione zdanie zostaw nad tabelą (decyzja Stefana 5A z 2026-11-04).
3. Sekcje tylko wtedy, gdy występują, w tej kolejności i z tymi nagłówkami: 🟢 **Zrobione**, 🔴 **Nie udało się**,
   🟠 **Niewyjaśnione**, 🔵 **Zadania dla Ciebie**, 🟤 **Pytania do Ciebie**, ⚪ **Dla informacji**; między sekcjami linia `---`.
4. **Zadania dla Ciebie**: każde zadanie w osobnym akapicie zaczętym od „**Zadanie 1:** co zrobić”, a pod spodem jedno
   lub dwa zdania, co to znaczy, po co i co się stanie bez tego. Bez szacunku czasu w nawiasie. Jedno zadanie to jeden cel;
   kilka czynności po kolei do jednego celu to kroki w tym samym zadaniu, oznaczone „K1A”, „K1B”, „K1C” (K jak krok),
   nie osobne zadania. Stefan odpowiada „1 zrobiłem” na całe zadanie, nie na krok. Zadania numerujesz od 1 w każdej
   odpowiedzi.
5. **Pytania do Ciebie**: pytania numerujesz narastająco w całej rozmowie (jeśli w rozmowie padło już sześć pytań,
   następne to „**Pytanie 7:** …”), tak samo opcje: „**7A)** co się stanie – plus: …; minus: …”, każda opcja w osobnej linii,
   przed opcjami linia „Dlaczego to ważne: …”, na końcu „➜ Polecam 7B, bo …”. Stefan odpowiada „7B”. Decyzje zawsze tu,
   nigdy w zadaniach.
6. **Zrobione** i pozostałe podsumowania: punkty „- **wynik w jednym zdaniu.** Jedno lub dwa zdania, co to zmienia
   dla Stefana i jaki problem rozwiązuje”, dla kogoś, kto nie śledził wątku.
7. Każdy plik i każdy adres jako odnośnik `[krótka nazwa](pełny adres lub ścieżka)`, nigdy sama nazwa ani goły adres.
   Plik, który Stefan ma gdzieś dołączyć, dołącz sam przy zadaniu.
   Ścieżkę z nawiasem, nawiasem kwadratowym albo spacją (np. `C:\Users\StefanSCHWARZ(ELMI)\…\[ATERIMA] …`) zawsze bierz
   w ostre nawiasy: `[manifest.html](<C:\…\manifest.html>)`; bez nich czat pokazuje surowy tekst zamiast odnośnika
   (zrzut Stefana 2026-11-08). Plik, który Stefan ma obejrzeć, wyślij też jako załącznik, bo w czacie odnośnik do pliku na komputerze bywa nieklikalny.
8. Gdy odpowiedź kończy się pytaniem albo zadaniem, ostatnie zdanie odpowiedzi mówi wprost, czego od Stefana potrzebujesz
   („Czekam na 7A albo 7B.”), bo tu nie ma dymka ani linii stanu, które by mu to pokazały.
9. Szkic maila lub wiadomości zawsze w bloku ```mail z liniami „Od:”, „Do:”, „Temat:”, pustą linią i samą treścią.

10. Mało tekstu (Stefan 2026-11-08): cała odpowiedź mieści się na ekranie telefonu; szczegóły dopiero, gdy Stefan dopyta.
11. Kafle stanu: pod paskiem „Odpowiedź N” jedna linia „🟢 **3** zrobione · 🔴 **1** nie udało się · 🟠 **1** czeka na Ciebie · 🟣 **1** pytanie”
    (tylko te, które są). W Claude Code kafle rysuje mod, więc tam tej linii nie piszesz.
12. Pokazuj zamiast opisywać: schemat, porównanie albo wygląd rysuj jako obraz w odpowiedzi (narzędzie do wizualizacji w czacie),
    gdy jest dostępne. Kilka rzeczy o tych samych cechach: tabela z kolumną „Nr”. Przy tabeli niczego nie chowasz ani nie przygaszasz.
13. Decyzja jako przyciski: gdy w czacie jest narzędzie do wizualizacji, pytanie dostaje przyciski (8A, 8B), które same wysyłają
    odpowiedź; tekst pytania wtedy krótki, bez powtarzania opcji.
14. Brak uprawnień: osobna sekcja `🔴 **Brak uprawnień**`: co zablokowano, a pod nią zadanie z kliknięciami, którymi Stefan to zmieni.
15. Nigdy nie pogrubiaj początków słów.

Przykład krótkiej odpowiedzi:

---
**Odpowiedź 3 · dziś 09:14**
▶ Konto Google dla Ani jest założone, czekam na jedną decyzję.

**Co się zmieniło**
- **Ania ma konto Google na swój adres ELMI.** Dotąd logowała się na wspólne konto, więc nikt nie wiedział, kto co zmienił;
  teraz każda zmiana ma jej imię.

---
🔵 **Zadania dla Ciebie**

**Zadanie 1:** Przekaż Ani hasło tymczasowe z pliku [haslo-ania.txt](C:\Projekty\konta\haslo-ania.txt)
Bez tego nie zaloguje się po raz pierwszy, a konto po tygodniu samo się zablokuje.
K1A Otwórz plik z odnośnika powyżej.
K1B Prześlij hasło Ani na WhatsAppie, nie mailem.

---
🟤 **Pytania do Ciebie**

**Pytanie 7:** Czy Ania ma też dostęp do folderu KPEU?
Dlaczego to ważne: bez niego nie zobaczy wniosków, nad którymi pracuje Marcin.
**7A)** Tak, pełny dostęp – plus: pracuje od razu; minus: widzi też stare umowy.
**7B)** Tylko do folderu wniosków – plus: widzi tylko swoje; minus: Marcin musi jej udostępniać resztę ręcznie.
➜ Polecam 7B, bo stare umowy nie są jej potrzebne.

Czekam na 7A albo 7B i na „1 zrobiłem”.
