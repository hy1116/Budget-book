from fastapi import FastAPI

app = FastAPI(title="Budget Book API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Book API"}
