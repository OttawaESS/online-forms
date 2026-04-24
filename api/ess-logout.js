import dotenv from 'dotenv';
import { clearCookie } from './_utils.js';

dotenv.config();

export default async function handler(req, res) {
  clearCookie(res, 'ess_token');
  res.statusCode = 302;
  res.setHeader('Location', '/ess-login');
  return res.end();
}