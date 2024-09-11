import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// 아이템 구입 api
router.post('/item/buy', authMiddleware, async (req, res) => {
  console.log('테스트:', req.body);
  try {
    const { itemCode, count, characterId } = req.body;

    if (!itemCode || !count || !characterId) {
      return res
        .status(400)
        .json({ error: '아이템 코드와 수량, 캐릭터 아이디를 입력해야 합니다.' });
    }

    // 토큰 가져오기
    const userId = req.user.id;

    // 아이템 조회
    const item = await prisma.item.findUnique({
      where: { itemCode: itemCode },
    });

    if (!item) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }

    // Character 정보 확인
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    console.log(`캐릭터 잔액: ${character.money}, 아이템 가격: ${item.price}, 수량: ${count}`);

    // 계산
    const totalPrice = item.price * count;

    // 돈이 있는지 확인
    if (character.money < totalPrice) {
      return res.status(400).json({ error: '잔액이 부족합니다.' });
    }

    // 캐릭터 남은 돈 업데이트
    await prisma.character.update({
      where: { characterId: characterId },
      data: { money: character.money - totalPrice },
    });

    // 아이템을 인벤토리에 추가
    await prisma.inventory.create({
      data: {
        characterId: character.characterId,
        itemCode: itemCode,
        count: count,
      },
    });

    res.status(200).json({ message: '아이템 구매 완료' });
  } catch (error) {
    console.error('아이템 구매 중 오류 발생:', error);
    res.status(500).json({ error: '아이템 구매 중 오류가 발생했습니다.' });
  }
});

export default router;
