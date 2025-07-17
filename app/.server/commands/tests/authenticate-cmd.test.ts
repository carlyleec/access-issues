import { vi, expect, test, describe } from 'vitest'
import { newAuthenticateCmd } from '../authenticate-cmd.js'
import { newUserRepo } from '../../repo/user-repo'
import { generate } from '~/lib/token.js'
import { hash } from '~/lib/hash.js'

describe('authenticate-cmd', () => {
  test('with malformed jwt', async () => {
    const userRepo = newUserRepo()
    const mockedUserRepo = vi.mockObject(userRepo)
    const cmd = newAuthenticateCmd(mockedUserRepo)
    const result = await cmd('malformed', 'otp')
    expect(result.error?.message).toBe('Invalid Token')
  })
  test('with no user', async () => {
    const userRepo = newUserRepo()
    const mockedUserRepo = vi.mockObject(userRepo)
    mockedUserRepo.byEmail.mockResolvedValue(undefined)
    const cmd = newAuthenticateCmd(mockedUserRepo)
    const jwtRes = await generate('test@test.com')
    if (jwtRes.error) throw jwtRes.error
    const result = await cmd(jwtRes.data.jwt, 'otp')
    expect(result.error?.message).toBe('Unable to find user to authenticate.')
  })
  test('with invalid token hash', async () => {
    const userRepo = newUserRepo()

    const mockedUserRepo = vi.mockObject(userRepo)
    mockedUserRepo.byEmail.mockResolvedValue({
      id: '1',
      email: 'nomatch@test.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      otpHash: 'otpHash',
      tokenHash: 'tokenHash',
    })
    const cmd = newAuthenticateCmd(mockedUserRepo)
    const jwtRes = await generate('test@test.com')
    if (jwtRes.error) throw jwtRes.error
    const result = await cmd(jwtRes.data.jwt, 'otp')
    expect(result.error?.message).toBe('Invalid token hash')
  })
  test('with invalid otp hash', async () => {
    const userRepo = newUserRepo()
    const mockedUserRepo = vi.mockObject(userRepo)
    const cmd = newAuthenticateCmd(mockedUserRepo)
    const jwtRes = await generate('test@test.com')
    if (jwtRes.error) throw jwtRes.error
    mockedUserRepo.byEmail.mockResolvedValue({
      id: '1',
      email: 'nomatch@test.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      otpHash: 'wrong',
      tokenHash: jwtRes.data.tokenHash,
    })
    const result = await cmd(jwtRes.data.jwt, 'otp')
    expect(result.error?.message).toBe('Invalid OTP')
  })
  test('with valid token and otp', async () => {
    const userRepo = newUserRepo()
    const mockedUserRepo = vi.mockObject(userRepo)
    const cmd = newAuthenticateCmd(mockedUserRepo)
    const jwtRes = await generate('test@test.com')
    if (jwtRes.error) throw jwtRes.error
    const otpHashRes = await hash('123456')
    if (otpHashRes.error) throw otpHashRes.error
    mockedUserRepo.byEmail.mockResolvedValue({
      id: '1',
      email: 'nomatch@test.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      otpHash: otpHashRes.data,
      tokenHash: jwtRes.data.tokenHash,
    })
    const result = await cmd(jwtRes.data.jwt, '123456')
    expect(result.data).toEqual({
      userId: '1',
      email: 'nomatch@test.com',
      name: 'Test User',
    })
  })
})
