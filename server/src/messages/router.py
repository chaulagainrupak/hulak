from fastapi import APIRouter, Request

messageRouter = APIRouter()


@messageRouter.get("/message/{slug}")
def getMessage(slug: str):

    if slug == None:
        return {"message": "This is not a valid message please try again"}

    return {"message": "This is a test message"}


@messageRouter.post("/message")
async def getMessage(request: Request):

    requestJson = await request.json()
    print(requestJson)
    return {"message": "This is a test message"}
