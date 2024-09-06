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
    const itemcode = req.body.item_code;
    const itemname = req.body.item_name;
    const atk = req.body.atk;
    const price = req.body.price;

    const createitem = await prisma.item.create({
      data: {
        itemcode: itemcode,
        itemname: itemname,
        atk: atk,
        price: price,
      },
    });
    res.status(200).json({ item_info: createitem });
    console.log(createitem);
  } catch (error) {
    res.status(500).json({ error: '아이템 중복에 실패' });
    console.log(error);
  }
});

// [필수] 2. 아이템 목록 조회
router.get('/item/list', (req, res) => {
  prisma.item.findMany();
});

// [필수] 3. 특정 아이템 조회
// 아이템 코드는 URL의 parameter로 전달받기
router.get('/item/:itemCode', async (req, res) => {
  const itemCode = parseInt(req.params.itemCode);
  //찾기
  const result = await prisma.item.findUnique({ where: { itemCode: itemCode } });
  if (finditem == null) {
    res.status(404).json({ error: '아이템을 찾을 수 없어요' });
    return;
  }
  //보내기
  res.status(404).json({ item_info: finditem });
});

// [필수] 4. 특정 아이템 수정
// 아이템 코드는 URL의 parameter로 전달 받기
// 수정할 아이템 명, 아이템 능력을 req(request)에서 json으로 전달받기
router.post('/item/update', (req, res) => {
  prisma.item.update();
});

export default router;
