// Altri endpoint API - Barrel export per moduli interni
// Mantiene la stessa interfaccia del file other.ts originale
import { Router } from 'express';
import { pinRoutes } from './internal/pinRoutes';
import { exDipendentiRoutes } from './internal/exDipendentiRoutes';
import { storicoRoutes } from './internal/storicoRoutes';
import { userManagementRoutes } from './internal/userManagementRoutes';

const router = Router();

// Monta tutti i moduli interni mantenendo lo stesso ordine del file originale
router.use(pinRoutes);
router.use(exDipendentiRoutes);
router.use(storicoRoutes);
router.use(userManagementRoutes);

// Re-export del router come default per mantenere compatibilità
export default router;
