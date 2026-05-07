from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

# ================= DATABASE URL =================
DATABASE_URL = os.getenv("DATABASE_URL")

# ================= DB CONNECTION =================
def get_db_connection():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not set")

    return psycopg2.connect(DATABASE_URL)

# ================= INIT DB =================
def init_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        """)

        conn.commit()
        cur.close()
        conn.close()

        print("Database initialized")

    except Exception as e:
        print("DB Error:", e)

init_db()

# ================= REGISTER =================
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        username = data["username"]
        email = data["email"]
        password = data["password"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, password)
        )

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "User registered successfully"})

    except psycopg2.errors.UniqueViolation:
        return jsonify({"message": "Email already exists"}), 400

    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500


# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data["email"]
        password = data["password"]

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT username, email FROM users WHERE email=%s AND password=%s",
            (email, password)
        )

        user = cur.fetchone()

        cur.close()
        conn.close()

        if user:
            return jsonify({
                "message": "Login successful",
                "username": user[0],
                "email": user[1]
            })

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"message": "Server error", "error": str(e)}), 500


# ================= RUN (RENDER FIX) =================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
