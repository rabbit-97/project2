import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 6. [도전] 인증 미들웨어 구현
// 강의 내용 - 계획서(발제) 안보고 하다가 처음부터 다시 구현 필요
// Request의 Authorization 헤더에서 JWT를 가져와서 인증 된 사용자인지 확인하는 Middleware를 구현합니다
// 아이디, 비밀번호, 비밀번호 확인, 이름
// 영어 소문자랑 숫자로만 구성 되어야한다. 중복 불가
// 최소 여섯자 이상이며 비밀번호 확인과 일치

// 6-1. [도전] 회원가입
router.post('/account/join', async (req, res) => {
  try {
    const { accountId, accountPassword, confirmPassword, name } = req.body;

    if (!accountId || !accountPassword || !confirmPassword || !name) {
      return res.status(400).json({ error: '입력을 안한 부분이 있어요.' });
    }

    if (accountPassword !== confirmPassword) {
      return res.status(400).json({ error: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
    }
    // 이미 존재하는 계정인지 확인
    const existingAccount = await prisma.account.findUnique({
      where: { accountId: accountId },
    });

    if (existingAccount) {
      return res.status(400).json({ error: '이미 사용 중인 아이디입니다.' });
    }
    // 비밀번호 해시 값 만들기
    const hashedPassword = await bcrypt.hash(accountPassword, 10);
    // 계정 만들기
    const newAccount = await prisma.account.create({
      data: {
        accountId: accountId,
        accountPassword: hashedPassword,
        name: name,
      },
    });

    res.status(201).json({ message: '회원가입 성공', account: newAccount });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 6-2. [도전] 로그인
router.post('/account/login', async (req, res) => {
  try {
    const { accountId, accountPassword } = req.body;

    if (!accountId || !accountPassword) {
      return res.status(400).json({ error: '입력을 안한 부분이 있어요.' });
    }
    // 계정 존재여부 확인(중복 불가)
    const account = await prisma.account.findUnique({
      where: { accountId: accountId },
    });

    if (!account) {
      return res.status(401).json({ error: '존재하지 않는 계정입니다.' });
    }
    // 비밀번호 확인값과 일치하는지 확인
    const passwordMatch = await bcrypt.compare(accountPassword, account.accountPassword);
    if (!passwordMatch) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
    // 토큰 생성
    const token = jwt.sign(
      { accountId: account.accountId, name: account.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.status(200).json({ message: '로그인 성공', token: token });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
