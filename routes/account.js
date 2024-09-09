import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 6. [도전] 인증 미들웨어 구현
// Request의 Authorization 헤더에서 JWT를 가져와서 인증 된 사용자인지 확인하는 Middleware를 구현합니다

// 6-1. [도전] 회원가입
router.post('/account/join', async (req, res) => {
  try {
    const { accountId, accountPassword } = req.body;

    if (!accountId || !accountPassword) {
      return res.status(400).json({ error: '입력을 안한 부분이 있어요.' });
    }

    const hashedPassword = await bcrypt.hash(accountPassword, 10);

    const newAccount = await prisma.account.create({
      data: {
        accountId: +accountId,
        accountPassword: hashedPassword,
      },
    });

    res.status(201).json({ message: '회원가입 성공', account: newAccount });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});
// 6-2. [도전] 로그인
router.post('/account/login', (req, res) => {});

export default router;
