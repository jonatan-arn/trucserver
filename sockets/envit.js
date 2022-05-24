module.exports = function (io) {
  io.on("connection", function (socket) {
    socket.on("player:envit", (data) => {
      io.to(data.playerLeft.id).emit("envit", data);
      io.to(data.playerRight.id).emit("envit", data);
    });
    socket.on("response:envit", (data) => {
      const { state, oldState, right, left } = data;
      io.to(left.id).emit("await:response:end", {
        state,
        oldState,
        id: socket.id,
      });
      io.to(right.id).emit("await:response:end", {
        state,
        oldState,
        id: socket.id,
        type: "envit",
      });
    });
    socket.on("send:envit:status", (data) => {
      const lobbyID = String(socket.data.room);

      io.to(lobbyID).emit("envit:status", data);
    });
  });
};
