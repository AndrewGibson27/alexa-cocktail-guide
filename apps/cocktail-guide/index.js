const alexa = require('alexa-app');
const axios = require('axios');

module.change_code = 1;

const app = new alexa.app('cocktail-guide');
const API_URL = 'http://www.thecocktaildb.com/api/json/v1/1/filter.php';

function getRecipes(liquor) {
  return axios.get(`${API_URL}?i=${liquor}`);
}

function getRandomRecipe(allRecipes) {
  const max = allRecipes.length;
  const min = 0;
  const rand = Math.floor(Math.random() * (max - min + 1)) + min;

  return allRecipes[rand];
}

app.launch(function(req, res) {
  const prompt = 'What liquor are you in the mood for?';
  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('CocktailIntent', {
  slots: {
    LIQUOR: 'literal',
  },

  utterances: [
    '{tequila|rum|vodka|gin|scotch|bourbon|brandy|cognac|whisky|whiskey|LIQUOR}',
  ],
}, (req, res) => {
  const liquor = req.slot('LIQUOR');

  if (liquor) {
    res.reprompt('Sorry, I didn\'t hear that. Try again.');

    return getRecipes(liquor)
      .then((cocktailRes) => {
        const recipe = getRandomRecipe(cocktailRes.data.drinks);
        res.say(`You should try the ${recipe.strDrink}!`);
        res.shouldEndSession(false);
      })
      .catch((err) => {
        res.say('There was an error.');
      });
  } else {
    res.say('There was an error.');
  }
});

module.exports = app;
