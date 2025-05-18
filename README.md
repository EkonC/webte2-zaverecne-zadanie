# Inštrukcie pre Docker a vývoj frontendovej časti

> **Poznámka:** Frontend zatiaľ **nie je súčasťou `docker-compose`** (stav k dnešnému dňu 17.5. 2025).

## Docker – dôležité poznámky

Frontendová časť potrebuje **doplniť Dockerfile** na koniec – buď na základe servera alebo statického buildu, cez `pnpm build` @adykulik @Bonderukk @EkonC.

### Spustenie prostredia pomocou Docker Compose

Aby sa predišlo problémom pri aktualizácii kontajnerov, odporúčame nasledovný postup:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

Alternatívne (po prvotnej aktualizácii):

```bash
docker compose up
# alebo
docker compose up --build
```

## Vývoj frontendovej časti

Keďže frontend zatiaľ nie je zahrnutý v `docker-compose`, vývoj frontendovej časti prebieha nasledovne:

1. Prejdi do priečinka `frontend`:

```bash
cd frontend
```

2. Spusti vývojové prostredie podľa aktuálnych inštrukcií (napr. `pnpm dev`, `pnpm install`, atď.).

3. Po dokončení práce sa vráť späť do koreňového adresára:

```bash
cd ..
```

# Implementované funkcie na úpravu PDF

1. Zlúčiť PDF - Merge PDF
2. Extrahovať text z PDF - Extract text from PDF
3. Extrahovať obrázky z PDF - Extract images from PDF
4. Odstraňovanie stránok - Remove pages
5. Rotácia stránok - Rotate pages
6. Úprava textu - Edit text (dal by som skip)
7. Zmenšenie velkosti pdf - https://pypdf.readthedocs.io/en/latest/user/file-size.html
8. Pridanie vodoznaku - Add watermark
9. Export do PNG - Export to PNG
10. Export do JPG - Export to JPG
11. Viac strán na jednom liste - Multiple pages on one sheet
