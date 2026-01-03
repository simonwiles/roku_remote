FROM python:3.12-slim-trixie
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

WORKDIR /opt/roku-remote
COPY . /opt/roku-remote

RUN uv sync

CMD ["uv", "run", "python", "roku_remote.py"]
