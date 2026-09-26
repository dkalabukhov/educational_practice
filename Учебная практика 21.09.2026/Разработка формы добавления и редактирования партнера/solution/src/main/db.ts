import { Pool } from 'pg'

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'educational_practice',
  password: '1998',
  port: 5432
})
