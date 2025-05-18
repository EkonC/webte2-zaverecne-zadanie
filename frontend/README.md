# Vývoj

## Spustenie lokálneho development servera (pnpm)
1. `pnpm install` nainštaluje potrebné Node závislosti.
2. `virtualenv venv` vytvorí virtuálne prostredie.
3. `source venv/bin/activate` aktivuje virtuálne prostredie.
4. `pip install -r backend/requirements.txt` nainštaluje potrebné Python závislosti.
5. spustenie development servera + backendu
```bash
cd frontend
pnpm dev
```


## Docker

Znovu zostavenie všetkých image-ov a spustenie definovaných služieb.
```bash
docker-compose up --build
```
Vypnutie a zmazanie kontajnerov, sietí a volumes, vrátane dát.
```bash
docker-compose down --volumes
```
Jednorazové spustenie testov v Docker kontajneri.
```bash
docker-compose run --rm tests
```

# Implementované funkcie na úpravu PDF
1. Zlúčiť PDF - Merge PDF
2. Extrahovať text z PDF - Extract text from PDF
3. Extrahovať obrázky z PDF - Extract images from PDF
4. Odstraňovanie stránok - Remove pages
5. Rotácia stránok - Rotate pages
6. Úprava textu - Edit text
7. Pridanie vodoznaku - Add watermark
8. Export do PNG - Export to PNG
9. Export do JPG - Export to JPG
10. Viac strán na jednom liste - Multiple pages on one sheet
