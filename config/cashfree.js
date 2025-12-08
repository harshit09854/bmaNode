
import { Cashfree } from 'cashfree-pg';
import dotenv from 'dotenv';

dotenv.config();

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // or Cashfree.Environment.PRODUCTION

export default Cashfree;
