module.exports = function (io) {
  io.on("connection", function (socket) {
    socket.on("player:truc", (data) => {
      io.to(data.playerLeft.id).emit("truc", data);
      io.to(data.playerRight.id).emit("truc", data);
    });
    socket.on("response:truc", (data) => {
      const { state, oldState, right, left } = data;
      io.to(left.id).emit("await:response:end", {
        state,
        oldState,
        id: socket.id,
        type: "truc",
      });
      io.to(right.id).emit("await:response:end", {
        state,
        oldState,
        id: socket.id,
        type: "truc",
      });
    });
    socket.on("send:truc:status", (data) => {
      const lobbyID = String(socket.data.room);

      io.to(lobbyID).emit("truc:status", data);
    });
  });
};
