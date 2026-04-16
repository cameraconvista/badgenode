import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Mancano SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  console.error(
    'Esempio run: SUPABASE_URL=https://hjbungtedtgffmnficmp.supabase.co SUPABASE_SERVICE_ROLE_KEY=... npm run seed:auth'
  );
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Helper: upsert user by email
async function upsertUser({ email, password, user_metadata = {}, app_metadata = {} }) {
  // try get existing
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const found = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (found) {
    // update metadata if needed
    const { data, error } = await admin.auth.admin.updateUserById(found.id, {
      user_metadata,
      app_metadata,
      ban_duration: 'none',
    });
    if (error) throw error;
    console.log(`🔁 Updated user: ${email}`);
    return data.user;
  }

  // create new
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
    app_metadata,
  });
  if (error) throw error;
  console.log(`✅ Created user: ${email}`);
  return data.user;
}

(async () => {
  try {
    // 1) Dipendente di test
    await upsertUser({
      email: 'dipendente7@example.com',
      password: 'Passw0rd!7',
      user_metadata: { pin: 7 },
    });

    // 2) Admin (per gestione sistema)
    await upsertUser({
      email: 'admin@example.com',
      password: 'Passw0rd!Admin',
      user_metadata: { pin: 1 },
      app_metadata: { badgenode_role: 'admin' },
    });

    console.log('🎉 Seed completato.');
    console.log(
      '➡️  Prova login:\n  - admin@example.com / Passw0rd!Admin\n  - dipendente7@example.com / Passw0rd!7'
    );
    process.exit(0);
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  }
})();
