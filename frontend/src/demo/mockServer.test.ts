import { beforeAll, describe, expect, it, vi } from 'vitest'

// Minimal localStorage for the node test environment
beforeAll(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  })
})

const { mockFetch, MockHttpError, simulatePurchase, simulateRedeem } = await import('./mockServer')

const login = async (email: string) =>
  ((await mockFetch('POST', '/api/auth/login', { body: { email, password: 'x' }, token: null })) as { token: string }).token

const fail = async (p: Promise<unknown>) => {
  try {
    await p
  } catch (e) {
    if (e instanceof MockHttpError) return e.status
    throw e
  }
  return 200
}

describe('demo mock server', () => {
  it('serves public cafés and nearby search without a token', async () => {
    const page = (await mockFetch('GET', '/api/v1/coffee-shops', { query: { page: 0, size: 5 }, token: null })) as {
      content: unknown[]
      totalElements: number
    }
    expect(page.content).toHaveLength(5)
    expect(page.totalElements).toBe(14) // pending cafés are hidden
    const near = (await mockFetch('GET', '/api/v1/coffee-shops/nearby', { query: { lat: 46.7709, lng: 23.5899, radius: 2000 }, token: null })) as unknown[]
    expect(near.length).toBeGreaterThan(3)
  })

  it('enforces the same roles as the backend', async () => {
    const user = await login('ana.popescu@demo.beango')
    const admin = await login('admin@demo.beango')
    expect(await fail(mockFetch('GET', '/api/v1/admin/point-transactions', { token: user }))).toBe(403)
    expect(await fail(mockFetch('GET', '/api/v1/favorites', { token: null }))).toBe(401)
    expect(await fail(mockFetch('GET', '/api/v1/users/101/profile', { token: user }))).toBe(403) // someone else
    expect(await fail(mockFetch('GET', '/api/v1/users/101/profile', { token: admin }))).toBe(200)
    expect(await fail(mockFetch('GET', '/api/v1/coffee-shops/50', { token: null }))).toBe(404) // pending
  })

  it('lets an admin approve a pending café', async () => {
    const admin = await login('admin@demo.beango')
    await mockFetch('PATCH', '/api/v1/coffee-shops/50/approve', { token: admin })
    expect(await fail(mockFetch('GET', '/api/v1/coffee-shops/50', { token: null }))).toBe(200)
  })

  it('lists pending cafés by name and lets an admin deny one', async () => {
    const admin = await login('admin@demo.beango')
    type Pending = { id: number; name: string; merchantName: string | null; merchantEmail: string }
    const before = (await mockFetch('GET', '/api/v1/admin/coffee-shops/pending', { token: admin })) as { content: Pending[] }
    expect(before.content.length).toBeGreaterThan(0)
    expect(before.content.map((s) => s.id)).not.toContain(50) // approved in the previous test
    const target = before.content[0]
    expect(target.name).toBeTruthy()
    expect(target.merchantName).toBeTruthy()

    await mockFetch('DELETE', `/api/v1/admin/coffee-shops/pending/${target.id}`, { token: admin })
    const after = (await mockFetch('GET', '/api/v1/admin/coffee-shops/pending', { token: admin })) as { content: Pending[] }
    expect(after.content.map((s) => s.id)).not.toContain(target.id)

    // Approved cafés can't be denied
    expect(await fail(mockFetch('DELETE', '/api/v1/admin/coffee-shops/pending/50', { token: admin }))).toBe(409)
  })

  it('lets a merchant give points by customer email and see the result', async () => {
    const merchant = await login('mara.stan@demo.beango')
    const mine = (await mockFetch('GET', '/api/v1/merchant/coffee-shops', { token: merchant })) as Array<{ id: number; approved: boolean }>
    const live = mine.find((s) => s.approved)!
    const res = (await mockFetch('POST', '/api/v1/loyalty-points/transactions', {
      body: { customerEmail: 'Radu.Ionescu@demo.beango', coffeeShopId: live.id, pointsToAdd: 10 },
      token: merchant,
    })) as { customerName: string; pointsAdded: number }
    expect(res.customerName).toBe('Radu Ionescu')
    expect(res.pointsAdded).toBe(10)

    const unknown = mockFetch('POST', '/api/v1/loyalty-points/transactions', {
      body: { customerEmail: 'nobody@demo.beango', coffeeShopId: live.id, pointsToAdd: 10 },
      token: merchant,
    })
    expect(await fail(unknown)).toBe(404)
  })

  it('adds a merchant café as waiting for approval', async () => {
    const merchant = await login('mara.stan@demo.beango')
    const created = (await mockFetch('POST', '/api/v1/coffee-shops', {
      body: { name: 'Test Roastery', address: 'Str. Test 1', contactEmail: 'mara.stan@demo.beango', lat: 46.77, lng: 23.59 },
      token: merchant,
    })) as { id: number }
    const mine = (await mockFetch('GET', '/api/v1/merchant/coffee-shops', { token: merchant })) as Array<{ id: number; approved: boolean }>
    expect(mine.find((s) => s.id === created.id)?.approved).toBe(false)
    expect(await fail(mockFetch('GET', `/api/v1/coffee-shops/${created.id}`, { token: null }))).toBe(404) // not public yet
  })

  it('lets a merchant edit their own café, menu and hours, but not someone else’s', async () => {
    const merchant = await login('mara.stan@demo.beango')
    const mine = (await mockFetch('GET', '/api/v1/merchant/coffee-shops', { token: merchant })) as Array<{ id: number }>
    const id = mine[0].id
    const facilities = (await mockFetch('GET', '/api/v1/merchant/facilities', { token: merchant })) as Array<{ id: number; name: string }>
    expect(facilities.map((f) => f.name)).toContain('Parking')

    const updated = (await mockFetch('PUT', `/api/v1/merchant/coffee-shops/${id}`, {
      body: { name: 'Renamed Café', address: 'Str. Nouă 1', contactEmail: 'mara.stan@demo.beango', lat: 46.77, lng: 23.59, facilityIds: [1, 9] },
      token: merchant,
    })) as { name: string; facilities: Array<{ id: number }> }
    expect(updated.name).toBe('Renamed Café')
    expect(updated.facilities.map((f) => f.id).sort()).toEqual([1, 9])
    const badFacility = mockFetch('PUT', `/api/v1/merchant/coffee-shops/${id}`, {
      body: { name: 'X Café', address: 'A', contactEmail: 'a@b.c', lat: 1, lng: 1, facilityIds: [999] },
      token: merchant,
    })
    expect(await fail(badFacility)).toBe(404)

    const withItem = (await mockFetch('POST', `/api/v1/coffee-shops/${id}/menu`, {
      body: { category: 'Coffee', name: 'Test Latte', price: 15.5 },
      token: merchant,
    })) as { menu: Array<{ id: number; name: string }> }
    const item = withItem.menu.find((i) => i.name === 'Test Latte')!
    await mockFetch('DELETE', `/api/v1/coffee-shops/${id}/menu/${item.id}`, { token: merchant })
    const after = (await mockFetch('GET', `/api/v1/merchant/coffee-shops/${id}`, { token: merchant })) as { menu: Array<{ id: number }> }
    expect(after.menu.map((i) => i.id)).not.toContain(item.id)

    const late = mockFetch('PUT', `/api/v1/coffee-shops/${id}/schedule`, {
      body: [{ dayOfWeek: 'MONDAY', openTime: '20:00:00', closeTime: '08:00:00' }],
      token: merchant,
    })
    expect(await fail(late)).toBe(400)

    const someoneElse = await login('radu.ionescu@demo.beango')
    expect(await fail(mockFetch('GET', `/api/v1/merchant/coffee-shops/${id}`, { token: someoneElse }))).toBe(403)
    const other = (await mockFetch('GET', '/api/v1/coffee-shops', { query: { size: 50 }, token: null })) as { content: Array<{ id: number }> }
    const notMine = other.content.find((s) => !mine.some((m) => m.id === s.id))!
    expect(await fail(mockFetch('GET', `/api/v1/merchant/coffee-shops/${notMine.id}`, { token: merchant }))).toBe(403)
  })

  it('includes customer and merchant names in the points ledger', async () => {
    const admin = await login('admin@demo.beango')
    const page = (await mockFetch('GET', '/api/v1/admin/point-transactions', { query: { size: 5 }, token: admin })) as {
      content: Array<{ customerName: string | null; merchantName: string | null }>
    }
    expect(page.content[0].customerName).toBeTruthy()
    expect(page.content[0].merchantName).toBeTruthy()
  })

  it('runs the loyalty loop: purchase, voucher, redemption', async () => {
    const token = await login('radu.ionescu@demo.beango')
    const vouchers = () => mockFetch('GET', '/api/v1/vouchers/active', { token }) as Promise<unknown[]>
    expect(await vouchers()).toHaveLength(0)
    // Radu starts at 35 pts at one café; purchases until a voucher appears
    for (let i = 0; i < 6 && (await vouchers()).length === 0; i++) simulatePurchase('radu.ionescu@demo.beango')
    expect((await vouchers()).length).toBeGreaterThan(0)
    simulateRedeem('radu.ionescu@demo.beango')
    const stats = (await mockFetch('GET', '/api/v1/admin/vouchers/stats', { token: await login('admin@demo.beango') })) as {
      issued: number
      active: number
      used: number
      expired: number
    }
    expect(stats.active + stats.used + stats.expired).toBe(stats.issued)
  })

  it('registers a new customer and rejects a duplicate review with 409', async () => {
    const reg = { firstName: 'Test', lastName: 'Visitor', email: 'test.visitor@demo.beango', password: 'secret1' }
    const { token } = (await mockFetch('POST', '/api/auth/register', { body: reg, token: null })) as { token: string }
    expect(await fail(mockFetch('POST', '/api/auth/register', { body: reg, token: null }))).toBe(409)
    await mockFetch('POST', '/api/v1/coffee-shops/2/reviews', { body: { rating: 5, comment: 'Lovely' }, token })
    expect(await fail(mockFetch('POST', '/api/v1/coffee-shops/2/reviews', { body: { rating: 4 }, token }))).toBe(409)
  })
})
