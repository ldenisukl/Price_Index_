import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ===== CATEGORIES =====
  const categoryService = await prisma.category.upsert({
    where: { slug: 'services' },
    update: {},
    create: {
      name: 'Servicii',
      type: 'service',
      slug: 'services',
      description: 'Servicii profesionale în Moldova - electrician, instalator, design, etc.',
      icon: '⚙️',
      isActive: true
    }
  });

  const categoryCurrency = await prisma.category.upsert({
    where: { slug: 'currency' },
    update: {},
    create: {
      name: 'Valută',
      type: 'currency',
      slug: 'currency',
      description: 'Cursuri valutare - EUR, USD, RON în raport cu MDL',
      icon: '💱',
      isActive: true
    }
  });

  const categoryFuel = await prisma.category.upsert({
    where: { slug: 'fuel' },
    update: {},
    create: {
      name: 'Carburanți & Energie',
      type: 'fuel',
      slug: 'fuel',
      description: 'Prețuri carburant, energie, cotațiile burselor - WTI Oil',
      icon: '⛽',
      isActive: true
    }
  });

  const categoryProduct = await prisma.category.upsert({
    where: { slug: 'products' },
    update: {},
    create: {
      name: 'Produse',
      type: 'product',
      slug: 'products',
      description: 'Produse electrotehnice și articole generale',
      icon: '📦',
      isActive: true
    }
  });

  // ===== REGIONS =====
  const chisinau = await prisma.region.upsert({
    where: { name: 'Chișinău' },
    update: {},
    create: {
      name: 'Chișinău',
      type: 'city',
      isActive: true
    }
  });

  const balti = await prisma.region.upsert({
    where: { name: 'Bălți' },
    update: {},
    create: {
      name: 'Bălți',
      type: 'city',
      isActive: true
    }
  });

  const cahul = await prisma.region.upsert({
    where: { name: 'Cahul' },
    update: {},
    create: {
      name: 'Cahul',
      type: 'city',
      isActive: true
    }
  });

  // ===== PRICE ITEMS =====
  const electrician = await prisma.priceItem.upsert({
    where: { id: 'service-electrician' },
    update: {},
    create: {
      id: 'service-electrician',
      categoryId: categoryService.id,
      name: 'Electrician',
      description: 'Servicii electrice - instalații, reparații, diagnostic',
      unit: 'MDL/hr',
      isActive: true
    }
  });

  const plumber = await prisma.priceItem.upsert({
    where: { id: 'service-plumber' },
    update: {},
    create: {
      id: 'service-plumber',
      categoryId: categoryService.id,
      name: 'Plumber (Instalator)',
      description: 'Servicii instalații sanitare',
      unit: 'MDL/hr',
      isActive: true
    }
  });

  const cleaning = await prisma.priceItem.upsert({
    where: { id: 'service-cleaning' },
    update: {},
    create: {
      id: 'service-cleaning',
      categoryId: categoryService.id,
      name: 'Cleaning Service',
      description: 'Servicii curățenie locuințe și birouri',
      unit: 'MDL',
      isActive: true
    }
  });

  const webdesign = await prisma.priceItem.upsert({
    where: { id: 'service-webdesign' },
    update: {},
    create: {
      id: 'service-webdesign',
      categoryId: categoryService.id,
      name: 'Website Design',
      description: 'Proiecte web și design digital',
      unit: 'MDL',
      isActive: true
    }
  });

  const eurMdl = await prisma.priceItem.upsert({
    where: { id: 'currency-eur-mdl' },
    update: {},
    create: {
      id: 'currency-eur-mdl',
      categoryId: categoryCurrency.id,
      name: 'EUR / MDL',
      description: 'Curs Euro - Leu Moldovenesc',
      unit: 'MDL',
      isActive: true
    }
  });

  const usdMdl = await prisma.priceItem.upsert({
    where: { id: 'currency-usd-mdl' },
    update: {},
    create: {
      id: 'currency-usd-mdl',
      categoryId: categoryCurrency.id,
      name: 'USD / MDL',
      description: 'Curs Dolar - Leu Moldovenesc',
      unit: 'MDL',
      isActive: true
    }
  });

  const wtiOil = await prisma.priceItem.upsert({
    where: { id: 'fuel-wti-oil' },
    update: {},
    create: {
      id: 'fuel-wti-oil',
      categoryId: categoryFuel.id,
      name: 'WTI Oil',
      description: 'West Texas Intermediate - Crude Oil Futures',
      unit: 'USD',
      isActive: true
    }
  });

  // ===== PRICE ENTRIES =====
  // Electrician Chișinău
  await prisma.priceEntry.upsert({
    where: { id: 'entry-electrician-chisinau' },
    update: {},
    create: {
      id: 'entry-electrician-chisinau',
      priceItemId: electrician.id,
      regionId: chisinau.id,
      priceMin: 350,
      priceAvg: 450,
      priceMax: 600,
      currency: 'MDL',
      priceType: 'per hour',
      qualificationLevel: 'medium',
      sourceType: 'manual',
      sourceConfidence: 85,
      status: 'live'
    }
  });

  // Plumber Chișinău
  await prisma.priceEntry.upsert({
    where: { id: 'entry-plumber-chisinau' },
    update: {},
    create: {
      id: 'entry-plumber-chisinau',
      priceItemId: plumber.id,
      regionId: chisinau.id,
      priceMin: 300,
      priceAvg: 400,
      priceMax: 550,
      currency: 'MDL',
      priceType: 'per hour',
      qualificationLevel: 'medium',
      sourceType: 'manual',
      sourceConfidence: 80,
      status: 'live'
    }
  });

  // Cleaning Service Chișinău
  await prisma.priceEntry.upsert({
    where: { id: 'entry-cleaning-chisinau' },
    update: {},
    create: {
      id: 'entry-cleaning-chisinau',
      priceItemId: cleaning.id,
      regionId: chisinau.id,
      priceMin: 200,
      priceAvg: 400,
      priceMax: 600,
      currency: 'MDL',
      priceType: 'per day',
      sourceType: 'manual',
      sourceConfidence: 75,
      status: 'live'
    }
  });

  // Website Design
  await prisma.priceEntry.upsert({
    where: { id: 'entry-webdesign-remote' },
    update: {},
    create: {
      id: 'entry-webdesign-remote',
      priceItemId: webdesign.id,
      regionId: chisinau.id,
      priceMin: 2500,
      priceAvg: 4750,
      priceMax: 8000,
      currency: 'MDL',
      priceType: 'per project',
      sourceType: 'manual',
      sourceConfidence: 80,
      status: 'live'
    }
  });

  // EUR / MDL
  await prisma.priceEntry.upsert({
    where: { id: 'entry-eur-mdl-maib' },
    update: {},
    create: {
      id: 'entry-eur-mdl-maib',
      priceItemId: eurMdl.id,
      regionId: chisinau.id,
      priceMin: 19.28,
      priceAvg: 19.43,
      priceMax: 19.52,
      currency: 'MDL',
      priceType: 'exchange rate',
      sourceType: 'bank',
      sourceConfidence: 95,
      providerName: 'maib',
      status: 'live'
    }
  });

  // USD / MDL
  await prisma.priceEntry.upsert({
    where: { id: 'entry-usd-mdl-maib' },
    update: {},
    create: {
      id: 'entry-usd-mdl-maib',
      priceItemId: usdMdl.id,
      regionId: chisinau.id,
      priceMin: 17.79,
      priceAvg: 17.92,
      priceMax: 17.98,
      currency: 'MDL',
      priceType: 'exchange rate',
      sourceType: 'bank',
      sourceConfidence: 95,
      providerName: 'maib',
      status: 'live'
    }
  });

  // WTI Oil
  await prisma.priceEntry.upsert({
    where: { id: 'entry-wti-oil' },
    update: {},
    create: {
      id: 'entry-wti-oil',
      priceItemId: wtiOil.id,
      regionId: chisinau.id,
      priceMin: 77.32,
      priceAvg: 78.64,
      priceMax: 79.10,
      currency: 'USD',
      priceType: 'per barrel',
      sourceType: 'market',
      sourceConfidence: 100,
      status: 'live'
    }
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
