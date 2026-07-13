import AdminLayout from '@/components/admin/layout/AdminLayout';
import SettingsCard from '@/components/settings/SettingsCard';
import SecurityPinSection from '@/components/settings/SecurityPinSection';
import AnomalyAlertSection from '@/components/settings/AnomalyAlertSection';

export default function Impostazioni() {
  return (
    <AdminLayout title="Impostazioni">
      <div className="flex h-full flex-col">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-[#7A1228]">Impostazioni</h1>
        </div>

        {/* Layout a tutta pagina (NON modale): sezioni impilate a piena larghezza,
            allineate a sinistra. Pronto ad accogliere altre sezioni sotto. */}
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <SettingsCard
              title="PIN — Accesso app"
              subtitle="Gestisci la richiesta e il PIN per accedere all'app (schermata iniziale)."
            >
              <SecurityPinSection scope="general" targetLabel="all'app" />
            </SettingsCard>
            <SettingsCard
              title="PIN — Area amministrazione"
              subtitle="Gestisci la richiesta e il PIN di accesso all'area admin."
            >
              <SecurityPinSection scope="admin" targetLabel="all'area admin" />
            </SettingsCard>
            <SettingsCard
              title="Avviso timbrature anomale"
              subtitle="Segnala nello Storico le timbrature fuori dagli orari previsti."
            >
              <AnomalyAlertSection />
            </SettingsCard>
            {/* Le prossime sezioni si aggiungono qui come altre <SettingsCard>. */}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
