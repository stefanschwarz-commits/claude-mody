"""Przepisuje treść skilla ładnie-stefan (SKILL.md) do reguły ~/.claude/rules/wyglad-uklad-odpowiedzi.md.
Źródłem jest skill (decyzja Stefana 1B, 2026-11-20); reguła jest kopią. Nagłówek YAML reguły zostaje bez zmian.
Kopia poprzedniej reguły: wyglad-uklad-odpowiedzi.md.bak obok niej (poza folderem rules, żeby nie była czytana jako reguła).
Uruchom: python -X utf8 skills/uklad-odpowiedzi/do-reguly.py   (z --sprawdz tylko porównuje, niczego nie zapisuje)"""
import pathlib, shutil, sys

skill = pathlib.Path(__file__).with_name("SKILL.md")
regula = pathlib.Path.home() / ".claude" / "rules" / "wyglad-uklad-odpowiedzi.md"
kopia = pathlib.Path.home() / ".claude" / "kopie-regul" / "wyglad-uklad-odpowiedzi.md.bak"


def tresc_bez_naglowka(t: str) -> tuple[str, str]:
    if t.startswith("---\n"):
        koniec = t.index("\n---\n", 4) + 5
        return t[:koniec], t[koniec:]
    return "", t


_, cialo = tresc_bez_naglowka(skill.read_text(encoding="utf-8"))
naglowek, stare = tresc_bez_naglowka(regula.read_text(encoding="utf-8"))
if stare == cialo:
    print("Reguła już zgodna ze skillem.")
    sys.exit(0)
if "--sprawdz" in sys.argv:
    print("UWAGA: reguła różni się od skilla. Jeśli ktoś zmienił ją ręcznie, przenieś tę zmianę do SKILL.md przed przepisaniem.")
    sys.exit(1)
kopia.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(regula, kopia)
regula.write_text(naglowek + cialo, encoding="utf-8", newline="\n")
print(f"Reguła przepisana ze skilla ({len(cialo)} znaków); kopia poprzedniej: {kopia}")
