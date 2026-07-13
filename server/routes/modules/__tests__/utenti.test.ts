import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import utentiRouter from '../utenti';

const {
  selectBuilder,
  mutationBuilder,
  fromMock,
  appSettingsBuilder,
} = vi.hoisted(() => ({
  selectBuilder: {
    order: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  },
  mutationBuilder: {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  },
  fromMock: vi.fn(),
  // Builder per la lettura di app_settings fatta dal middleware requireAdminPin.
  appSettingsBuilder: {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  },
}));

// Instrada la chiamata di from() del middleware (app_settings) al suo builder,
// lasciando alle altre tabelle il comportamento configurato dai singoli test.
function routeFrom(handler: (table: string) => unknown) {
  fromMock.mockImplementation((table: string) => {
    if (table === 'app_settings') return appSettingsBuilder;
    return handler(table);
  });
}

// Header con il PIN admin di test: il middleware lo confronta col mock app_settings.
const ADMIN_HEADER = { 'x-admin-pin': '1909' } as const;

vi.mock('../../../lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: fromMock,
  },
}));

vi.mock('../../../lib/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
  },
}));

describe('utenti routes', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    selectBuilder.order.mockReset();
    selectBuilder.eq.mockReset();
    selectBuilder.single.mockReset();
    mutationBuilder.select.mockReset();
    mutationBuilder.eq.mockReset();
    mutationBuilder.single.mockReset();
    selectBuilder.eq.mockReturnValue(selectBuilder);
    mutationBuilder.select.mockReturnValue(mutationBuilder);
    mutationBuilder.eq.mockReturnValue(mutationBuilder);

    // Middleware requireAdminPin: legge app_settings id='admin' -> access_pin '1909'.
    appSettingsBuilder.select.mockReturnValue(appSettingsBuilder);
    appSettingsBuilder.eq.mockReturnValue(appSettingsBuilder);
    appSettingsBuilder.maybeSingle.mockResolvedValue({ data: { access_pin: '1909' }, error: null });

    app = express();
    app.use(express.json());
    app.use('/', utentiRouter);
  });

  it('GET /api/utenti restituisce i campi reali dal DB', async () => {
    selectBuilder.order.mockResolvedValue({
      data: [
        {
          pin: 10,
          nome: 'Mario',
          cognome: 'Rossi',
          email: 'mario@test.com',
          telefono: '123',
          ore_contrattuali: 7.5,
          note: 'note',
          created_at: '2026-01-01T10:00:00Z',
        },
      ],
      error: null,
    });

    fromMock.mockReturnValue({
      select: vi.fn(() => selectBuilder),
    });

    const response = await request(app).get('/api/utenti');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0]).toMatchObject({
      pin: 10,
      email: 'mario@test.com',
      telefono: '123',
      ore_contrattuali: 7.5,
      note: 'note',
    });
  });

  it('POST /api/utenti usa il client Supabase e persiste tutti i campi supportati', async () => {
    mutationBuilder.single.mockResolvedValue({
      data: {
        pin: 11,
        nome: 'Luigi',
        cognome: 'Verdi',
        email: 'luigi@test.com',
        telefono: '555',
        ore_contrattuali: 6,
        note: 'part-time',
        created_at: '2026-01-01T10:00:00Z',
      },
      error: null,
    });

    const insertMock = vi.fn(() => mutationBuilder);
    routeFrom(() => ({
      insert: insertMock,
    }));

    const response = await request(app).post('/api/utenti').set(ADMIN_HEADER).send({
      pin: 11,
      nome: ' Luigi ',
      cognome: ' Verdi ',
      email: ' luigi@test.com ',
      telefono: ' 555 ',
      ore_contrattuali: 6,
      note: ' part-time ',
    });

    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledWith({
      pin: 11,
      nome: 'Luigi',
      cognome: 'Verdi',
      email: 'luigi@test.com',
      telefono: '555',
      ore_contrattuali: 6,
      note: 'part-time',
    });
    expect(response.body.data).toMatchObject({
      pin: 11,
      email: 'luigi@test.com',
      telefono: '555',
      ore_contrattuali: 6,
      note: 'part-time',
    });
  });

  it('POST /api/utenti gestisce il PIN duplicato con 409', async () => {
    mutationBuilder.single.mockResolvedValue({
      data: null,
      error: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    });

    routeFrom(() => ({
      insert: vi.fn(() => mutationBuilder),
    }));

    const response = await request(app).post('/api/utenti').set(ADMIN_HEADER).send({
      pin: 12,
      nome: 'Anna',
      cognome: 'Bianchi',
      ore_contrattuali: 8,
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('PIN_TAKEN');
  });

  it('PUT /api/utenti/:pin aggiorna i campi supportati senza any/bypass', async () => {
    mutationBuilder.single.mockResolvedValue({
      data: {
        pin: 13,
        nome: 'Carlo',
        cognome: 'Neri',
        email: 'carlo@test.com',
        telefono: null,
        ore_contrattuali: 8,
        note: null,
        created_at: '2026-01-01T10:00:00Z',
      },
      error: null,
    });

    const updateMock = vi.fn(() => mutationBuilder);
    routeFrom(() => ({
      update: updateMock,
    }));

    const response = await request(app).put('/api/utenti/13').set(ADMIN_HEADER).send({
      nome: ' Carlo ',
      email: ' carlo@test.com ',
      telefono: '   ',
    });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      nome: 'Carlo',
      email: 'carlo@test.com',
      telefono: null,
    });
    expect(response.body.success).toBe(true);
  });
});
