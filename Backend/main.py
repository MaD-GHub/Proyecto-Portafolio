from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "¡Bienvenido a tu backend con FastAPI!"}
