const socket = io => {
  io.on("connection", socket => {
    console.log("CONNECTION: ", socket.id);

    socket.on("joinArena", arenaId => {
      socket.join(arenaId);
      console.log("JOINS ROOM: ", socket.id);
    });

    socket.on("leaveArena", arenaId => {
      socket.leave(arenaId);
      console.log("LEAVES ROOM: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("DISCONNECTION");
    });
  });
};

module.exports = socket;
