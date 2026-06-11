import bcrypt from "bcryptjs";

import { pool } from "../../db/pool.js";
import type { AuthUser } from "../../types/auth.js";
import { AppError } from "../../middleware/errorHandler.js";
import { signAuthToken } from "../../middleware/auth.js";

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  password_hash: string;
}

export async function login(email: string, password: string) {
  const result = await pool.query<DbUser>(
    "select id, email, name, role, password_hash from users where lower(email) = lower($1) limit 1",
    [email]
  );
  const user = result.rows[0];

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new AppError(401, "Invalid credentials");
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  return {
    user: authUser,
    token: signAuthToken(authUser)
  };
}
