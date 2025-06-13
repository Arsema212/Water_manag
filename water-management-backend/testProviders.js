const fetch = require('node-fetch');

const testFetch = async () => {
  const res = await fetch('http://localhost:5000/api/providers', {
    method: 'GET',
     
  });

  const data = await res.json();
  console.log("Server replied with:", data);
};

testFetch();
