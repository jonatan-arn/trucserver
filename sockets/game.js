module.exports = function (io) {
  io.on("connection", function (socket) {
    socket.on("send:cards", (cards) => {
      const lobbyID = String(socket.data.room);
      io.to(lobbyID).emit("start:game", cards);
    });
    socket.on("played:card", (data) => {
      const lobbyID = String(socket.data.room);
      io.to(lobbyID).emit("played:card", data);
    });

    socket.on("await:response:start", (data) => {
      //const lobbyID = String(socket.data.room);
      io.to(data.me.id).emit("await:response:start");
      io.to(data.top.id).emit("await:response:start");
    });
  });
};
