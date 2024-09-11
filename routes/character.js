import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// [필수] **3. 캐릭터 생성**
router.post('/character/create', authMiddleware, async (req, res) => {
  try {
    const { characterId } = req.body;
    const { accountId } = req.user;

    if (!characterId) {
      return res.status(400).json({ error: '캐릭터 ID가 필요합니다.' });
    }
    // 캐릭터 생성
    const createCharacter = await prisma.character.create({
      data: {
        characterId: characterId,
        account: {
          connect: { accountId: accountId },
        },
      },
    });

    res.status(200).json({ character_info: createCharacter });
    console.log(createCharacter);
  } catch (error) {
    console.error('캐릭터 생성 실패:', error);

    if (error.code === 'P2002') {
      res.status(400).json({ error: '중복된 캐릭터 이름입니다.' });
    } else {
      res.status(500).json({ error: '캐릭터 생성 중 오류가 발생했습니다.' });
    }
  }
});
// [필수] **4. 캐릭터 삭제**
router.post('/character/delete', authMiddleware, async (req, res) => {
  try {
    const { characterid } = req.body;
    const userId = req.user.id;
    // 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { characterId: characterid },
    });

    if (!character) {
      return res.status(404).json({ error: '해당 캐릭터를 찾을 수 없습니다.' });
    }

    // 캐릭터와 연관된 인벤토리 및 장착 아이템 삭제
    await prisma.inventory.deleteMany({
      where: { characterId: characterid },
    });
    await prisma.equippedItem.deleteMany({
      where: { characterId: characterid },
    });

    // 캐릭터 삭제
    await prisma.character.delete({
      where: { characterId: characterid },
    });

    res.status(200).json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('캐릭터 삭제 실패:', error);

    if (error.code === 'P2025') {
      res.status(400).json({ error: '찾을 수 없는 아이디입니다.' });
    } else {
      res.status(500).json({ error: '캐릭터 삭제 중 오류가 발생했습니다.' });
    }
  }
});

// [필수] **5. 캐릭터 상세 조회**
router.get('/character/detail/:characterId', authMiddleware, async (req, res) => {
  const { characterId } = req.params;
  const userId = req.user ? req.user.accountId : null;

  try {
    // 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });

    if (character) {
      // 로그인 한 유저가 캐릭터 소유자면 전체 정보 공개
      if (userId && character.accountId === userId) {
        res.status(200).json(character);
      } else {
        // 아니라면 일부 정보 공개(돈 제외 모든 정보)
        const { money, ...publicCharacterData } = character;
        res.status(200).json(publicCharacterData);
      }
    } else {
      res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('캐릭터 조회 실패:', error);
    res.status(500).json({ error: '캐릭터 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
