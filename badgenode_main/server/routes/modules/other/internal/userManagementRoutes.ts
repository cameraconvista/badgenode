// User management routes - Aggregatore micro-split
import { Router } from 'express';
import { testPermissionsRoutes } from './userManagement/testPermissionsRoutes';
import { deleteRoutes } from './userManagement/deleteRoutes';
import { archiveRoutes } from './userManagement/archiveRoutes';
import { restoreRoutes } from './userManagement/restoreRoutes';
import { exDipendentiDeleteRoutes } from './userManagement/exDipendentiDeleteRoutes';

const router = Router();

// Monta tutti i micro-moduli mantenendo lo stesso ordine del file originale
router.use(testPermissionsRoutes);
router.use(deleteRoutes);
router.use(archiveRoutes);
router.use(restoreRoutes);
router.use(exDipendentiDeleteRoutes);

export { router as userManagementRoutes };
