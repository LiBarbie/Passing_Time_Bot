const path = require("path");
const fs = require('fs');
fs_dir = "./log";

data = "patata";
date2 = Date.parse(data);
try{
console.log(new Date(data).toISOString());
}
catch(error){
    console.log("attenzioneh");
}