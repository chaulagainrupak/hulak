from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .letters.router import letterRouter
from .openGraph import ogpRouter

app = FastAPI()

origins = [
    "http://localhost:4321",
    "http://localhost:8080",
    "https://hulak.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(letterRouter)
app.include_router(ogpRouter)