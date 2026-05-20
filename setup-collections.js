/**
 * NexusKey — Setup automat colectii Shopify
 * Ruleaza: node setup-collections.js
 */

const STORE_URL = 'STORE_URL_AICI';       // ex: nexuskey.myshopify.com
const ACCESS_TOKEN = 'TOKEN_AICI';         // din Shopify Admin → Apps → API credentials

// -------------------------------------------------------

async function shopifyRequest(path, method = 'GET', body = null) {
  const url = `https://${STORE_URL}/admin/api/2024-01/${path}`;
  const opts = {
    method,
    headers: {
      'X-Shopify-Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${err}`);
  }
  return res.json();
}

const collections = [
  {
    title: 'Windows',
    handle: 'windows',
    body_html: '<p>Licente originale Microsoft Windows — Windows 11 Pro, Home, OEM, Retail, Windows 10 si Windows Server. Livrare instant prin email.</p>',
    rules: [
      { column: 'tag', relation: 'equals', condition: 'Sistem Operare' },
    ],
    disjunctive: false,
    sort_order: 'price-ascending',
  },
  {
    title: 'Office',
    handle: 'office',
    body_html: '<p>Licente originale Microsoft Office — Office 2024, 2021, 2019, 2016. Activare online sau telefonica. Livrare instant prin email.</p>',
    rules: [
      { column: 'tag', relation: 'equals', condition: 'Microsoft Office' },
    ],
    disjunctive: false,
    sort_order: 'price-ascending',
  },
  {
    title: 'Pachete Promotionale',
    handle: 'bundles',
    body_html: '<p>Pachete software la preturi speciale — Windows + Office, Office + Adobe si multe altele. Economii de pana la 60%.</p>',
    rules: [
      { column: 'product_type', relation: 'equals', condition: 'Bundle' },
    ],
    disjunctive: false,
    sort_order: 'price-ascending',
  },
  {
    title: 'Professional',
    handle: 'professional',
    body_html: '<p>Software profesional — Visual Studio, Microsoft Project, Adobe Acrobat. Licente originale la preturi reduse.</p>',
    rules: [
      { column: 'tag', relation: 'equals', condition: 'Visual Studio' },
      { column: 'tag', relation: 'equals', condition: 'Adobe' },
      { column: 'tag', relation: 'equals', condition: 'Project' },
    ],
    disjunctive: true,
    sort_order: 'price-ascending',
  },
];

async function createNavMenu(collectionIds) {
  try {
    await shopifyRequest('menus.json', 'POST', {
      menu: {
        title: 'Main Menu',
        handle: 'main-menu',
        items: [
          { title: 'Windows', url: '/collections/windows', type: 'collection_link' },
          { title: 'Office', url: '/collections/office', type: 'collection_link' },
          { title: 'Pachete', url: '/collections/bundles', type: 'collection_link' },
          { title: 'Professional', url: '/collections/professional', type: 'collection_link' },
          { title: 'Cum functioneaza', url: '/pages/cum-functioneaza', type: 'page_link' },
        ],
      },
    });
    console.log('✅ Meniu navigare creat');
  } catch (e) {
    console.log('⚠️  Meniu: configureaza manual in Admin → Navigation');
  }
}

async function main() {
  console.log('\n🚀 NexusKey — Setup colectii Shopify\n');

  if (STORE_URL === 'STORE_URL_AICI' || ACCESS_TOKEN === 'TOKEN_AICI') {
    console.error('❌ EROARE: Completeaza STORE_URL si ACCESS_TOKEN in fisier!');
    console.log('\nCum obtii token-ul:');
    console.log('1. Shopify Admin → Settings → Apps and sales channels');
    console.log('2. Develop apps → Create an app → "NexusKey Setup"');
    console.log('3. Configure Admin API scopes: read_products, write_products,');
    console.log('   read_collections, write_collections');
    console.log('4. Install app → Copy "Admin API access token"\n');
    process.exit(1);
  }

  for (const col of collections) {
    try {
      const { smart_collection } = await shopifyRequest(
        'smart_collections.json',
        'POST',
        {
          smart_collection: {
            title: col.title,
            handle: col.handle,
            body_html: col.body_html,
            rules: col.rules,
            disjunctive: col.disjunctive,
            sort_order: col.sort_order,
            published: true,
          },
        }
      );
      console.log(`✅ Colectie creata: ${col.title} → /collections/${col.handle} (ID: ${smart_collection.id})`);
    } catch (e) {
      if (e.message.includes('taken') || e.message.includes('already')) {
        console.log(`⏭️  Colectia "${col.title}" exista deja — skip`);
      } else {
        console.error(`❌ Eroare la "${col.title}":`, e.message);
      }
    }
  }

  await createNavMenu();

  console.log('\n✅ Setup complet! Verifica colectiile la:');
  console.log(`   https://${STORE_URL}/admin/collections\n`);
  console.log('Pasii urmatori:');
  console.log('1. Shopify Admin → Online Store → Navigation → Main menu');
  console.log('2. Adauga linkurile: Windows, Office, Pachete, Professional');
  console.log('3. Salveaza si acceseaza site-ul\n');
}

main().catch(console.error);
