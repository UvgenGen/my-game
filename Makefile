.PHONY: build up down clean

help:
	@echo "Available targets:"
	@echo "  build             Build the Docker images"
	@echo "  up                Create and run Docker containers"
	@echo "  down              Stop and remove Docker containers"
	@echo "  clean             Stop and remove Docker containers, networks, volumes, and orphaned containers"
	@echo "  backend-logs      Show logs from the running backend containers"
	@echo "  frontend-logs     Show logs from the running frontend containers"
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
	docker logs -f --tail 100 mygame_web_1

frontend-logs:
	docker logs -f --tail 100 mygame_frontend-app-mygame_1

backend-shell:
	docker exec -it mygame_web_1 bash
