var express = require("express");
var router = express.Router();
var prismaClient = require("@prisma/client");
const prisma = new prismaClient.PrismaClient();

router.post("/", async function (req, res, next) {
  const players = req.body;
  const game = await prisma.game.create({
    data: { team1Points: 0, team2Points: 0 },
  });
  for (let p of players) {
    const { user, room, playerNumber } = p;
    const team =
      playerNumber == 1 || playerNumber == 3 ? "equipo 1" : "equipo 2";
    let newp = await prisma.user.create({
      data: {
        name: p.user,
        gameID: game.id,
        team: team,
        roomID: parseInt(p.room),
      },
    });
  }
  res.json(game);
});
router.put("/:id", async function (req, res, next) {
  const id = Number(req.params.id);
  const { team1Points, team2Points } = req.body;
  const game = await prisma.game.update({
    where: {
      id: id,
    },
    data: {
      team1Points,
      team2Points,
    },
  });

  res.json(game);
});

router.get("/games", async function (req, res, next) {
  const game = await prisma.game.findMany();
  res.json(game);
});

router.get("/users", async function (req, res, next) {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get("/users/:id", async function (req, res, next) {
  const { id } = req.params;
  const users = await prisma.user.findMany({
    where: {
      gameID: Number(id),
    },
    include: { game: true },
  });
  res.json(users);
});

module.exports = router;
