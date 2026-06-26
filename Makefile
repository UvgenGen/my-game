.PHONY: build up stop down clean requirements \
	backend-logs frontend-logs backend-shell frontend-shell \
	backend-restart frontend-restart frontend-reset migrate test help

help:
	@echo "Available targets:"
	@echo "  build             Build the Docker images"
	@echo "  up                Create and run Docker containers"
	@echo "  stop              Stop Docker containers"
	@echo "  down              Stop and remove Docker containers"
	@echo "  clean             Stop and remove containers, networks, volumes, and orphans"
	@echo "  backend-logs      Follow logs from the backend container"
	@echo "  frontend-logs     Follow logs from the frontend container"
	@echo "  backend-shell     Open a shell in the backend container"
	@echo "  frontend-shell    Open a shell in the frontend container"
	@echo "  backend-restart   Restart the backend container"
	@echo "  frontend-restart  Restart the frontend container"
	@echo "  frontend-reset    Clear the Next/Turbopack cache (.next) and restart the frontend"
	@echo "  migrate           Run Django migrations in the backend container"
	@echo "  test              Run the Django test suite (use ARGS=game.tests.X to scope)"
	@echo "  help              Show this help message"

requirements:
	pip install -r mygame/requirements.txt

build:
	@docker-compose build

up:
	@docker-compose up -d

stop:
	@docker-compose stop

down:
	@docker-compose down

clean:
	@docker-compose down --volumes --remove-orphans

backend-logs:
	@docker-compose logs -f --tail 100 mygame

frontend-logs:
	@docker-compose logs -f --tail 100 frontend-app-mygame

backend-shell:
	@docker-compose exec mygame bash

frontend-shell:
	@docker-compose exec frontend-app-mygame sh

backend-restart:
	@docker-compose restart mygame

frontend-restart:
	@docker-compose restart frontend-app-mygame

# Turbopack's incremental cache (in the mounted .next dir) can corrupt after
# rapid edits, surfacing as "Could not parse module" on valid files. A plain
# restart does not clear it because .next lives on the host volume.
frontend-reset:
	@docker-compose stop frontend-app-mygame
	@rm -rf frontend-app-mygame/.next
	@docker-compose up -d frontend-app-mygame
	@echo "Frontend .next cache cleared and container restarted."

migrate:
	@docker-compose exec mygame python manage.py migrate --settings=mygame.settings.development

test:
	@docker-compose exec mygame python manage.py test $(ARGS) --settings=mygame.settings.development
