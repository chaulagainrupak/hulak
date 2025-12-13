from fastapi import FastAPI

from messages import messageRouter

app = FastAPI()
app.include_router(messageRouter)

