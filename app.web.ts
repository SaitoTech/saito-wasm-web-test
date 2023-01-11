import Saito from './saito';

console.log("testing 123");

let saito = new Saito();

console.log("111");
saito.initialize().then(()=>{
    console.log("xxxx");
});

module.exports = saito;
