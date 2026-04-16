// Router aggregatore per moduli timbrature (Governance compliant ≤220 righe)
import { Router } from 'express';
import postManual from './postManual';
import postTimbratura from './postTimbratura';
import deleteTimbrature from './deleteTimbrature';
import updateTimbratura from './updateTimbratura';

const router = Router();

// Monta tutti i moduli mantenendo gli endpoint originali
router.use('/', postManual);
router.use('/', postTimbratura);
router.use('/', deleteTimbrature);
router.use('/', updateTimbratura);

export default router;
