const { Mutex } = require("async-mutex");

const mutexes = new Map();
const betsByRoom = new Map();

const socket = io => {
  io.on("connection", socket => {
    socket.on("joinArena", data => {
      socket.join(data.arenaId);

      if (!mutexes.has(data.arenaId)) {
        mutexes.set(data.arenaId, {
          meron: new Mutex(),
          wala: new Mutex(),
        });

        betsByRoom.set(data.arenaId, {
          totalMeron: 0,
          totalWala: 0,
        });
      }
    });

    socket.on("leaveArena", arenaId => {
      socket.leave(arenaId);
    });

    socket.on("reset:total-bets", data => {
      votesByRoom.set(data.arenaId, {
        totalYesVote: 0,
        totalNoVote: 0,
      });
    });

    socket.on("add:total-bets", async data => {
      const { bet, amount, arenaId } = data;

      const mutex = mutexes.get(arenaId)[bet];
      const release = await mutex.acquire();

      try {
        if (bet === "wala") {
          betsByRoom.get(arenaId)[`totalWala`] += amount;
        }

        if (bet === "meron") {
          betsByRoom.get(arenaId)[`totalMeron`] += amount;
        }

        io.to(arenaId).emit("updated:total-bets", {
          ...betsByRoom.get(arenaId),
        });
      } finally {
        release();
      }
    });

    socket.on("get:total-bets", arenaId => {
      io.to(arenaId).emit("updated:total-bets", {
        ...betsByRoom.get(arenaId),
      });
    });

    socket.on("disconnect", () => {
      console.log("DISCONNECTION");
    });
  });
};

module.exports = {
  socket,
  betsByRoom,
};
