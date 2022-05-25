module.exports = function (io) {
  //On init frontend
  io.on("connection", function (socket) {
    //Emit success on conected
    socket.emit("connected", { id: socket.id });
    //On disconected disconect socket and leave room
    socket.on("disconnected", () => {
      socket.leave(socket.data.room);
      socket.disconnect();
    });

    //On create room
    socket.on("create:room", (data) => {
      //Generate room id
      let roomID = "" + Math.floor(Math.random() * 90) + 100;
      //Check if room id already use and generate other in case
      let checkRoom = io.sockets.adapter.rooms.get(roomID);
      if (checkRoom == undefined) socket.join(roomID);
      while (checkRoom != undefined) {
        roomID = "" + Math.floor(Math.random() * 90000) + 10000;
        checkRoom = io.sockets.adapter.rooms.get(roomID);
      }

      //Get user name and roomd id and save it on socket
      socket.data.username = data.user;
      socket.data.room = roomID;
      socket.data.owner = true;
      //Emit connected to room with socket data
      socket.emit("connected:room", {
        user: data.user,
        room: roomID,
        id: socket.id,
      });
    });

    //On joining room
    socket.on("join:room", async (data) => {
      //Get user and room id of the frontend form
      const user = data.user;
      const roomID = data.roomID;

      //Check room id exists
      const room = io.sockets.adapter.rooms.get(roomID);
      if (room == undefined) {
        socket.emit("undefined:room");
      } else {
        //Get all sockets in that room
        const sockets = await io.in(roomID).fetchSockets();
        let socketsUsers = [];

        //Save all username in the room and check if the username is already in use
        for (let s of sockets) socketsUsers.push(s.data.username);
        if (socketsUsers.includes(user)) socket.emit("name:in:room");
        //Check if room is full (limit 4)
        else if (sockets.length == 4) {
          socket.emit("full:room");
        } else {
          //Join room all requisits valid
          socket.data.username = user;
          socket.data.room = roomID;
          socket.data.owner = false;
          socket.join(roomID);

          //Emit connected to room
          socket.emit("connected:room", {
            user: data.user,
            room: roomID,
            id: socket.id,
          });

          //Emit to all players but only execute on the owner that a new player join room
          let so = await io.in(roomID).fetchSockets();
          for (let s of so) {
            if (s.data.owner) {
              s.emit("new:player:owner", {
                user: user,
                room: roomID,
                id: socket.id,
              });
              break;
            }
          }
        }
      }
    });

    //On update players view for the players that are not the owner to update the view
    socket.on("updateplayers:room", (data) => {
      const lobbyID = String(socket.data.room);
      io.to(lobbyID).emit("new:player", data.players);
    });

    //On player leave room
    socket.on("leave:room", (data) => {
      const lobbyID = String(socket.data.room);

      //Player leave room
      socket.leave(lobbyID);

      //Emit player leave with new players array and the player who leave
      io.to(lobbyID).emit("leave:player", {
        socketLeave: socket.data,
      });
    });
  });
};
