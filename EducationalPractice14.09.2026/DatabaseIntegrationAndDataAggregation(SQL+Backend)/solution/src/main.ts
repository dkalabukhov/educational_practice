import { getPartnersWithDiscount, pool } from '../getPartnersWithDiscount';

async function main() {
  const partners = await getPartnersWithDiscount();
  console.log(partners);

  const partner = await getPartnersWithDiscount(6);
  console.log(partner);
  await pool.end();
}

main();