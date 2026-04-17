from fastapi import APIRouter
from ..db import get_stamps_dict_by_id

stamps_router = APIRouter()


@stamps_router.get("/stamps")
def get_stamps():
    return get_stamps_dict_by_id()