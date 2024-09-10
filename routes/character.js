import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// [필수] 3. 캐릭터 생성
router.post('/character/create', async (req, res) => {
  try {
    const characterId = req.body.characterid;
    const health = req.body.health;
    const power = req.body.power;
    const money = req.body.money;

    const createCharacter = await prisma.character.create({
      data: {
        characterId: characterId,
        health: health,
        power: power,
        money: money,
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
// [필수] 4. 캐릭터 삭제
router.post('/character/delete', async (req, res) => {
  try {
    const characterId = req.body.characterid;
    console.log(`캐릭터 아이디 : ${characterId}`);
    console.log(typeof req.body.characterid);
    await prisma.character.delete({
      where: {
        characterId,
      },
    });

    res.status(200).json({ character_info: createCharacter });
    console.log(createCharacter);
  } catch (error) {
    console.error('캐릭터 삭제 실패:', error);

    if (error.code === 'P2025') {
      res.status(400).json({ error: '찾을 수 없는 아이디 입니다..' });
    } else {
      res.status(500).json({ error: '캐릭터 삭제 중 오류가 발생했습니다.' });
    }
  }
});

// [필수] 5. 캐릭터 상세 조회
router.get('/character/detail/:characterId', async (req, res) => {
  const { characterId } = req.params;
  console.log(`캐릭터 아이디 : ${characterId}`);
  console.log(typeof req.body.characterid);
  try {
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });
    if (character) {
      res.status(200).json(character);
    } else {
      res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('캐릭터 조회 실패:', error);
    res.status(500).json({ error: '캐릭터 조회 중 오류가 발생했습니다.' });
  }
});

// 6-3. [도전] "회원"에 귀속된 캐릭터를 생성하기
router.post('/character/createfromuser', async (req, res) => {
  const { characterId } = req.body;

  const account = await prisma.account.findUnique({
    where: { accountId: characterId },
  });

  if (!account) {
    return res.status(404).json({ error: '존재하지 않는 회원입니다.' });
  }
});

// 6-4. [도전] "회원"에 귀속된 캐릭터를 삭제하기
router.post('/character/createfrom', (req, res) => {});

export default router;
