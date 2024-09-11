import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// **아이템 구입 api**
router.post('/item/buy', authMiddleware, async (req, res) => {
  console.log('테스트:', req.body);
  try {
    const { itemCode, count, characterId } = req.body;

    if (!itemCode || !count || !characterId) {
      return res
        .status(400)
        .json({ error: '아이템 코드와 수량, 캐릭터 아이디를 입력해야 합니다.' });
    }

    // 아이템 조회
    const item = await prisma.item.findUnique({
      where: { itemCode: itemCode },
    });

    if (!item) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }

    // 캐릭터 정보 확인
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

// **아이템 판매 api**
router.post('/item/sell', authMiddleware, async (req, res) => {
  try {
    const { itemCode, count, characterId } = req.body;

    // 요청에서 아이템 코드와 수량, 캐릭터 아이디를 받아옴
    if (!itemCode || !count || !characterId) {
      return res
        .status(400)
        .json({ error: '아이템 코드와 수량, 캐릭터 아이디를 입력해야 합니다.' });
    }
    // 아이템 조회
    const item = await prisma.item.findUnique({
      where: { itemCode: itemCode },
    });

    if (!item) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }

    // 캐릭터 정보 확인
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 아이템 인벤토리 확인
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        characterId: characterId,
        itemCode: itemCode,
      },
    });

    if (!inventoryItem || inventoryItem.count < count) {
      return res.status(400).json({ error: '판매 할 아이템이 없어요.' });
    }

    // 판매 가격 계산
    const totalPrice = item.price * count;

    // 캐릭터 장비 판매 후 돈 업데이트
    await prisma.character.update({
      where: { characterId: characterId },
      data: { money: { increment: totalPrice * 0.6 } },
    });

    // 아이템 인벤토리에서 제거
    await prisma.inventory.updateMany({
      where: {
        characterId: characterId,
        itemCode: itemCode,
      },
      data: {
        count: {
          decrement: count,
        },
      },
    });

    // 만약 아이템 개수가 0이 되면 인벤토리에서 삭제
    const updatedInventoryItem = await prisma.inventory.findFirst({
      where: {
        characterId: characterId,
        itemCode: itemCode,
      },
    });

    if (updatedInventoryItem && updatedInventoryItem.count === 0) {
      await prisma.inventory.delete({
        where: {
          inventoryId: updatedInventoryItem.inventoryId,
        },
      });
    }

    res.status(200).json({ message: '아이템 판매 완료' });
  } catch (error) {
    console.error('아이템 판매 중 오류 발생:', error);
    res.status(500).json({ error: '아이템 판매 중 오류가 발생했습니다.' });
  }
});

// **아이템 장착**
// 요청 본문에서 characterId, itemCode, count를 전달받아 캐릭터에게 아이템을 장착
router.post('/item/equip', authMiddleware, async (req, res) => {
  try {
    const { characterId, itemCode } = req.body;

    if (!characterId || !itemCode) {
      return res.status(400).json({ error: '필수 입력 값이 누락되었습니다.' });
    }

    // 캐릭터가 존재하는지 확인
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 아이템이 존재하는지 확인
    const item = await prisma.item.findUnique({
      where: { itemCode: itemCode },
    });

    if (!item) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }

    // 기존 장착된 아이템이 있는지 확인
    // 아이템 장착 가능 공간 최대 1개
    // 다른 아이템을 장착하면 기존 아이템은 장착 해제 하도록 구현 했습니다
    const EquippedItem = await prisma.equippedItem.findFirst({
      where: { characterId: characterId },
    });

    let currentHealth = 0;
    let currentPower = 0;

    if (EquippedItem) {
      // 기존 장착된 아이템의 스탯을 가져오기
      const existingItem = await prisma.item.findUnique({
        where: { itemCode: EquippedItem.itemCode },
      });

      if (existingItem) {
        currentHealth = existingItem.hth;
        currentPower = existingItem.atk;
      }

      // 기존 아이템 제거
      await prisma.equippedItem.delete({
        where: { equippedItemId: EquippedItem.equippedItemId },
      });
    }

    // 새 아이템 장착
    await prisma.equippedItem.create({
      data: {
        characterId: characterId,
        itemCode: itemCode,
      },
    });

    // 새 아이템의 스탯 적용
    const updatedCharacter = await prisma.character.update({
      where: { characterId: characterId },
      data: {
        health: {
          increment: item.hth - currentHealth,
        },
        power: {
          increment: item.atk - currentPower,
        },
      },
    });

    res.status(200).json({ message: `아이템 ${item.itemName} 장착 성공`, updatedCharacter });
  } catch (error) {
    console.error('아이템 장착 실패:', error);
    res.status(500).json({ error: '아이템 장착 중 오류가 발생했습니다.' });
  }
});

// **아이템 장착 해제**
router.post('/item/unequip', authMiddleware, async (req, res) => {
  try {
    const { characterId } = req.body;

    if (!characterId) {
      return res.status(400).json({ error: '입력 안한 부분이 있습니다.' });
    }

    // 캐릭터가 존재하는지 확인
    const character = await prisma.character.findUnique({
      where: { characterId: characterId },
    });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 장착된 아이템이 있는지 확인
    const equippedItem = await prisma.equippedItem.findFirst({
      where: { characterId: characterId },
    });

    if (!equippedItem) {
      return res.status(404).json({ error: '장착된 아이템이 없습니다.' });
    }

    // 장착된 아이템의 정보를 가져오기
    const item = await prisma.item.findUnique({
      where: { itemCode: equippedItem.itemCode },
    });

    if (!item) {
      return res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }

    // 아이템 장착 해제
    await prisma.equippedItem.delete({
      where: { equippedItemId: equippedItem.equippedItemId },
    });

    // 캐릭터의 스탯에서 아이템의 효과를 제거
    const updatedCharacter = await prisma.character.update({
      where: { characterId: characterId },
      data: {
        health: {
          decrement: item.hth,
        },
        power: {
          decrement: item.atk,
        },
      },
    });

    res.status(200).json({ message: `아이템 ${item.itemName} 장착 해제`, updatedCharacter });
  } catch (error) {
    console.error('아이템 장착 해제 실패:', error);
    res.status(500).json({ error: '아이템 장착 해제 중 오류가 발생했습니다.' });
  }
});

export default router;
