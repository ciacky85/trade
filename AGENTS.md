# Regole di Progetto per gli Agenti AI

- **Git Push Automatico**: Al termine di ogni sessione di sviluppo, implementazione o modifica richiesta dall'utente, esegui sempre automaticamente `git add`, `git commit` con messaggio descrittivo in italiano e `git push origin main`.
- **Aggiornamento Versioni**: Ad ogni sessione di sviluppo o avanzamento, incrementa sempre il numero di versione del progetto (es. `v0.1.0` -> `v0.2.0` -> `v0.3.0`...) sincronizzandolo in backend (`main.py`, `storage.py`, `system.py`), frontend (`package.json`, `DashboardLayout.tsx`) e documentazione (`TRADING_APP_SPEC.md`).
