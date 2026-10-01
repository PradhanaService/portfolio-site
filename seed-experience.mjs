// One-shot seed script — inserts missing experience items into Supabase
// Run with: node seed-experience.mjs

const SUPABASE_URL = 'https://txiterlxsxpymfgqmvwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4aXRlcmx4c3hweW1mZ3FtdndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODkxODEsImV4cCI6MjEwNDM2NTE4MX0._i81CvvG6XEdRtSlwebCp7Jr-mpcTKQGLIyK29LeGwM';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// All 4 experience items as they should appear (order descending = B.Com first)
const items = [
  {
    order: 4,
    date_range: '2020 — 2023',
    title: 'Bachelor of Commerce (B.Com) — Sri Ramakrishna College of Arts & Science',
    description: 'Graduated from Sri Ramakrishna College of Arts & Science, Coimbatore.'
  },
  {
    order: 3,
    date_range: 'Certification',
    title: 'AI Tools & ChatGPT Workshop — Be10X Academy',
    description: 'Certified in generative AI tools, prompt design, automated content workflows, and AI-driven digital marketing research.'
  },
  {
    order: 2,
    date_range: '2025',
    title: 'Digital Marketing & Business Analytics — KGiSL MicroCollege',
    description: 'Specialized professional program focusing on advanced digital marketing strategies, SEO audits, Meta ad campaign optimization, and business data analytics.'
  },
  {
    order: 1,
    date_range: 'Sep 2025 — Apr 2026',
    title: 'Digital Marketing Executive — BiTS Informatics, Coimbatore',
    description: '• Executed SEO strategies to improve website visibility and keyword rankings.\n• Managed and optimized Meta Ad campaigns for better audience engagement.\n• Performed website audits using SEO tools and analytics platforms.\n• Used Google Analytics and Search Console for performance tracking and reporting.'
  }
];

async function run() {
  // 1. Fetch existing items with their IDs
  const res = await fetch(`${SUPABASE_URL}/rest/v1/experience_items?select=id,order,title`, { headers });
  const existing = await res.json();
  console.log('Existing items in DB:', existing.map(e => `id=${e.id} order=${e.order} "${e.title.slice(0, 40)}"`));

  const existingByOrder = Object.fromEntries(existing.map(e => [e.order, e]));

  // 2. Upsert all items (insert missing, update existing with clean bullet descriptions)
  for (const item of items) {
    const existingItem = existingByOrder[item.order];
    if (existingItem) {
      // Update using ID
      const upRes = await fetch(`${SUPABASE_URL}/rest/v1/experience_items?id=eq.${existingItem.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ description: item.description, title: item.title, date_range: item.date_range })
      });
      const text = await upRes.text();
      console.log(`✅ Updated order=${item.order} (id=${existingItem.id}): status ${upRes.status} ${text || ''}`);
    } else {
      // Insert new item
      const insRes = await fetch(`${SUPABASE_URL}/rest/v1/experience_items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item)
      });
      const insData = await insRes.json();
      console.log(`✅ Inserted order=${item.order}: "${item.title.slice(0, 50)}" — status: ${insRes.status}`, insData);
    }
  }

  console.log('\n✅ Done! All experience items are now in Supabase.');
}

run().catch(err => console.error('Error:', err));
