import logging, sys
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(levelname).1s %(name)s: %(message)s",
)