const fs = require('fs');
const csv = require("csv-parser");
const axios = require('axios');

const transactionTypeDeposit = "DEPOSIT";
const transactionTypeWithdrawal = "WITHDRAWAL";

// return token price
async function getTokensPrice(tokens){
  try {
    const result = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tokens.join(',')}`);
    return result.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//convert "1000"=>"1,000"
const commafy=(num)=>{
  var str = num.toString().split('.');
  if (str[0].length >= 5) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }
  if (str[1] && str[1].length >= 5) {
    str[1] = str[1].replace(/(\d{3})/g, '$1 ');
  }
  return str.join('.');
}

// retrieve and return portfolios
exports.getPortfolios = (req, res)=>{
  let tokenData = {};
  let token = req.body.token ? req.body.token.toUpperCase() : null;
  let date = req.body.date ? new Date(req.body.date).getTime() : null;
  fs.createReadStream('assets/csv/transactions.csv')
  .pipe(csv({}))
  .on('error', () => {
    res.status(500).send({ message : "The file contents are not correct." })
  })
  .on('data', (data)=>{
    let transaction = null;
    let timestamp = data.timestamp * 1000;
    if(date && token){
      //Given a date and a token, return the portfolio value of that token in USD on that date
      if((timestamp <= date) && (token == data.token)){
        transaction = data;
      }
    } else if(token){
      //Given a token, return the latest portfolio value for that token in USD
      if(token.toUpperCase() == data.token){
        transaction = data;
      }
    } else if(date){
      //Given a date, return the portfolio value per token in USD on that date
      if(timestamp <= date){
        transaction = data;
      }
    } else {
      //Given no parameters, return the latest portfolio value per token in USD
      transaction = data;
    }
    if(transaction != null){
      if(tokenData[data.token] === undefined){
        tokenData[data.token] = 0;
      }
      tokenData[data.token] += (data.transaction_type == transactionTypeDeposit ? 1 : (-1)) * data.amount;
    }
  })
  .on('end', async()=>{
    let portfolios = [];
    let tokens = Object.keys(tokenData);
    for(let i = 0; i < tokens.length; i++){
      const tokens_price = await getTokensPrice(tokens);
      portfolios.push({
        token:tokens[i], 
        amount:tokenData[tokens[i]], 
        price:(tokens_price != null && tokens_price[tokens[i]] !== undefined) ? commafy(tokens_price[tokens[i]] * tokenData[tokens[i]]) : 0
      });
    }
    res.send(portfolios);
  });
}