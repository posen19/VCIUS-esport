const mariadb = require('mariadb');
const moment = require('moment');
let pool = null;

module.exports = {
  connect: function(config){
    connect(config);
  },
  getVicios: async function(username,twitch){
    return await getVicios(username, twitch);
  },
  createUser: function(username,twitch){
    createUser(username, twitch);
  },
  updateVicios: function(username, vicios){
    updateVicios(username,vicios);
  },
  actuActividad: function(username, vicios, tipo){
    actuActividad(username, vicios, tipo);
  },
  getRolesDedic: async function(roles){
    return await getRolesDedic(roles);
  }
}

function connect(config){
  pool = mariadb.createPool(config.database);
}

async function getVicios(username, twitch){
  console.log("getVicios("+username+","+twitch+")");
  let conn;
  let res;
  let resp = null;
  let count = 0;
  try {
    conn = await pool.getConnection();
    if (twitch)
      resp = await conn.query("SELECT * FROM user WHERE name_tw=?", [username]);
    else
      resp = await conn.query("SELECT * FROM user WHERE name_disc=?", [username]);
    if(resp.length = 1 && resp[0] != null){
      resp = resp[0];
    }else {
      if(resp[0] == null){
        console.log("No existe el usuario.")
        await createUser(username, twitch);
        if (twitch)
          resp = await conn.query("SELECT * FROM user WHERE name_tw=?", [username]);
        else
          resp = await conn.query("SELECT * FROM user WHERE name_disc=?", [username]);
      }
      else{
        console.log("Ha habido más de 1 respuesta.")
        resp = null;
      }
    }
  } catch (e) {
    resp = null;
  } finally {
    if (conn) conn.end();
    return await Promise.resolve(JSON.stringify(resp));
  }
}

async function createUser(username, twitch) {
  console.log("createUser("+username+","+twitch+")");
  let conn;
  let usernameD = null,
      usernameT = null;
      res = null;
  //miramos si ya existe:
  try{
    conn = await pool.getConnection();
    if (twitch)
      res = await conn.query("SELECT * FROM user WHERE name_tw=?", [username]);
    else
      res = await conn.query("SELECT * FROM user WHERE name_disc=?", [username]);
    if(res.length = 1 && res[0] != null){
      res = res[0];
    } else {
      res == null;
    }
  } catch (err) {
    res = null;
  } finally {
    if (conn) await conn.end();
  }
  //si existe entonces ponemos fecha
  if(res != null && res.length > 0 && res[0] != null){
    //pero solo si viene de twitch
    if(twitch){
      await updateTime(username, twitch);
    }
    return;
  }

  if(twitch) usernameT=username;
  else usernameD=username;

  let hash = makeid(username);
  try {
  	conn = await pool.getConnection();
    console.log("Antes del insert", "INSERT INTO user(name_tw, name_disc, vcios, hash, t_init) value ("+0+","+usernameT+","+usernameD+","+200+","+hash+",null)");
  	res = await conn.query("INSERT INTO user(name_tw,name_disc,vcios,hash,t_init) values (?, ?, ?, ?, ?)", [usernameT, usernameD, 200, hash, moment().utc().format('YYYY-MM-DD hh:mm:ss')]);
  } catch (err) {
    console.log("ERROR", err)
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

async function updateVicios(username, vicios){
  console.log("updateVicios("+username+","+vicios+")");
  let conn;
  try{
    conn = await pool.getConnection();
    let res = await conn.query("call actualizaActividad(?,?,?)", [username, vicios, 1]);
  } catch (err) {
    console.log("ERROR", err);
  } finally {
    if (conn) return conn.end();
  }
}

async function actuActividad(username, vicios, tipo){
  console.log("actuActividad("+username+","+vicios+","+tipo+")");
  let con, res;
  try {
    con = await pool.getConnection();
    res = await getVicios(username, false);
    console.log(res);
    if (res.length = 1 && res[0] != null){
      await con.query("call actualizaActividad(?,?,?)", [username, vicios, tipo]);
    }
    else{
      throw new Exception("No se ha encontrado usuario especifico.");
    }
  } catch (e) {
    console.log("ERROR", e);
  } finally {
    if (con) return con.end();
  }
}

async function getRolesDedic(roles){
  console.log("getRolesDedic("+roles+")");
  let con, res, res2;
  var arr = [], arr2 = [];
  try {
    con = await pool.getConnection();
    res = await con.query("SELECT roleName FROM adminrole");
    if(res.length > 0){
      for(var i=0;i<roles.length;i++){
        for(var j=0;j<res.length;j++){
          if(res[j].roleName == roles[i]){
            arr.push(roles[i]);
          }
        }
      }
      console.log(arr);
      res2 = {arr:[]};
      for(var i = 0; i < arr.length; i++){
        var aux = await con.query("SELECT r.rolName FROM rolesclavo r, adminrole a WHERE r.idAdmin = a.id AND a.roleName = ?", [arr[i]]);
        res2.arr = await res2.arr.concat(aux);
      }
      res = res2;
    }
  }
  catch(e){
    console.log("ERR", e);
    res = null;
  }
  finally{
    if (con) await con.end();
  }
  res = await Promise.resolve(JSON.stringify(res));
  await console.log(await res);
  return await res;
}

function makeid(possible) {
  var text = "";

  for (var i = 0; i < 25; i++)
    text += possible.charAt(Math.floor(Math.random(24) * possible.length));

  return Buffer.from(text).toString('base64');
}
