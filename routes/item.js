import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// [심화] 라우터마다 prisma 클라이언트를 생성하고 있다. 더 좋은 방법이 있지 않을까?
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// [필수] 1. 아이템 생성
// 1. 아이템 코드, 아이템 명, 아이템 능력, 아이템 가격을 req(request)에서 json으로 전달받기
// 2. 데이터베이스에 아이템 저장하기
router.post('/item/create', async (req, res) => {
  try {
    // 아이템 정보 요청 보내기
    const itemCode = req.body.itemcode;
    const itemName = req.body.itemname;
    const atk = req.body.atk;
    const hth = req.body.hth;
    const price = req.body.price;
    // 데이터 베이스에 아이템 저장
    const createItem = await prisma.item.create({
      data: {
        itemCode: itemCode,
        itemName: itemName,
        atk: atk,
        hth: hth,
        price: price,
      },
    });
    res.status(200).json({ item_info: createItem });
    console.log(createItem);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: '중복된 아이템 코드입니다.' });
    } else {
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
    console.error('아이템 생성 오류:', error);
  }
});

// [필수] 2. 아이템 목록 조회
router.get('/item/list', async (req, res) => {
  try {
    // 아이템 목록 조회
    const items = await prisma.item.findMany({
      select: {
        itemCode: true,
        itemName: true,
        price: true,
      },
    });
    res.status(200).json({ items });
  } catch (error) {
    console.error('아이템 목록 조회 실패:', error);
    res.status(500).json({ error: '아이템 목록 조회 중 오류 발생' });
  }
});

// [필수] 3. 특정 아이템 조회
// 아이템 코드는 URL의 parameter로 전달받기
router.get('/item/:itemCode', async (req, res) => {
  try {
    // url로 아이템 코드를 전달 받아서 해당 아이템 정보 상세 조회
    const itemCode = parseInt(req.params.itemCode);
    // 데이터 베이스에서 특정 아이템 조회
    const findItem = await prisma.item.findUnique({
      where: { itemCode: itemCode },
      select: {
        itemCode: true,
        itemName: true,
        hth: true,
        atk: true,
        price: true,
      },
    });

    if (!findItem) {
      return res.status(404).json({ error: '아이템을 찾을 수 없어요' });
    }
    // 아이템 상세 정보 값 응답
    const response = {
      itemCode: findItem.itemCode,
      itemName: findItem.itemName,
      stat: {
        hth: findItem.hth,
        atk: findItem.atk,
      },
      price: findItem.price,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('아이템 조회 실패:', error);
    res.status(500).json({ error: '아이템 조회에 실패했어요' });
  }
});

// [필수] 4. 특정 아이템 수정
// 아이템 코드는 URL의 parameter로 전달 받기
// 수정할 아이템 명, 아이템 능력을 req(request)에서 json으로 전달받기
router.post('/item/update/:itemCode', async (req, res) => {
  try {
    // url로 아이템 코드 전달받기
    const itemCode = +req.params.itemCode;
    const { itemName, hth, atk } = req.body;
    // 데이터 베이스에 수정 값 등록
    const updatedItem = await prisma.item.update({
      where: { itemCode },
      data: {
        itemName,
        hth,
        atk,
      },
    });
    res.status(200).json({ message: '아이템이 수정되었습니다.', updatedItem });
  } catch (error) {
    console.error('아이템 수정 실패:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    } else {
      res.status(500).json({ error: '아이템 수정 중 오류가 발생했습니다.' });
    }
  }
});

export default router;
