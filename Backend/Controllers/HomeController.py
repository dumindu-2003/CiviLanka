from fastapi import APIRouter

router = APIRouter(tags=["Home"])


@router.get("/")
def Index():
    return "!!Test!!"
