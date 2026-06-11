import pg from "pg";

import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export type Queryable = Pick<pg.Pool | pg.PoolClient, "query">;
