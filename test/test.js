const pool = require('../index')
.create()
.addWorker(({name, gender}) => {
    const salutation = gender === 'm' ? 'Mr' : 'Mrs'
    return new Promise(resolve => setTimeout(
        () => resolve(`Hello, ${salutation} ${name}`), 5000))
}).addWorker(({name, gender}) => {
    const salutation = gender === 'm' ? 'Señor' : 'Señora'
    return new Promise(resolve => setTimeout(
        () => resolve(`Hola, ${salutation} ${name}`), 3000))
})

const data =[ 
    { name: 'Heisenberg', gender: 'm' },
    { name: 'Wrexler', gender: 'f' },
    { name: 'Bruin', gender: 'f' },
    { name: 'Trop', gender: 'm' },
    { name: 'Fring', gender: 'm' } 
].forEach(d => {
    pool.run(d, {wait:true, timeout: 1000})
        .then(m => console.log('Greet:', m))
        .catch(e => console.error(e.message))
})

